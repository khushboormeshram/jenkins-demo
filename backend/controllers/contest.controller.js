import Contest from '../models/Contest.model.js';
import Submission from '../models/Submission.model.js';
import { notificationService } from '../services/notificationService.js';

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
export const getContests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        // Build query based on user role and visibility
        const query = {};

        if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
            // Teachers and admins can see all contests
            if (status) query.status = status;
        } else if (req.user && req.user.role === 'student') {
            // Students can see:
            // 1. Public contests
            // 2. Private contests where they belong to allowed classes
            
            // First, find classes the student belongs to
            const Class = (await import('../models/Class.model.js')).default;
            const studentClasses = await Class.find({ students: req.user.id }).select('_id');
            const studentClassIds = studentClasses.map(cls => cls._id);
            
            query.$or = [
                { visibility: 'public' },
                { 
                    visibility: 'private', 
                    allowedClasses: { $in: studentClassIds } 
                }
            ];
            
            if (status) query.status = status;
        } else {
            // Unauthenticated users only see public contests
            query.visibility = 'public';
            if (status) query.status = status;
        }

        const contests = await Contest.find(query)
            .populate('createdBy', 'name')
            .populate('problems', 'title difficulty')
            .populate('allowedClasses', 'name code')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ startTime: -1 });

        // Update status for each contest
        contests.forEach(contest => contest.updateStatus());

        const count = await Contest.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                contests,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single contest
// @route   GET /api/contests/:id
// @access  Public
export const getContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('problems', 'title difficulty tags description examples testCases constraints')
            .populate('participants.user', 'name')
            .populate('allowedClasses', 'name code');

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check if user can access this contest
        if (req.user && req.user.role === 'student' && contest.visibility === 'private') {
            // Check if student belongs to allowed classes
            const Class = (await import('../models/Class.model.js')).default;
            const studentClasses = await Class.find({ students: req.user.id }).select('_id');
            const studentClassIds = studentClasses.map(cls => cls._id.toString());
            const allowedClassIds = contest.allowedClasses.map(cls => cls._id.toString());
            
            const hasAccess = allowedClassIds.some(classId => studentClassIds.includes(classId));
            
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have access to this contest'
                });
            }
        } else if (!req.user && contest.visibility === 'private') {
            return res.status(403).json({
                success: false,
                message: 'This contest is private. Please login to access.'
            });
        }

        contest.updateStatus();
        await contest.save();

        // If user is authenticated, check registration and add submission status
        if (req.user) {
            const contestData = contest.toObject();
            
            // Check if user is registered for this contest (unless they are teacher/admin)
            const isTeacherOrAdmin = req.user.role === 'teacher' || req.user.role === 'admin';
            const isRegistered = contest.participants.some(p => p.user._id.toString() === req.user.id);
            
            if (!isTeacherOrAdmin && !isRegistered) {
                // Return contest info without problems for unregistered students
                return res.status(200).json({
                    success: true,
                    data: {
                        ...contestData,
                        problems: [], // Hide problems for unregistered students
                        isRegistered: false
                    }
                });
            }
            
            // Get user's submissions for this contest
            const userSubmissions = await Submission.find({
                user: req.user.id,
                contest: contest._id
            }).populate('problem', '_id');
            

            // Create a map of problem submissions
            const submissionMap = {};
            userSubmissions.forEach(submission => {
                const problemId = submission.problem._id.toString();
                if (!submissionMap[problemId] || submission.status === 'Accepted') {
                    submissionMap[problemId] = submission.status;
                }
            });

            // Add status to each problem
            if (contestData.problems) {
                contestData.problems = contestData.problems.map(problem => {
                    const problemStatus = submissionMap[problem._id.toString()] === 'Accepted' ? 'solved' : 
                                         submissionMap[problem._id.toString()] ? 'attempted' : 'not_attempted';
                    return {
                        ...problem,
                        status: problemStatus
                    };
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    ...contestData,
                    isRegistered: true
                }
            });
        } else {
            res.status(200).json({
                success: true,
                data: contest
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create contest
// @route   POST /api/contests
// @access  Private (Teacher/Admin)
export const createContest = async (req, res) => {
    try {
        const contestData = {
            ...req.body,
            createdBy: req.user.id
        };

        const contest = await Contest.create(contestData);

        // Send email notifications based on contest visibility
        if (contest.visibility === 'private' && contest.allowedClasses && contest.allowedClasses.length > 0) {
            console.log('Sending email notifications for private contest...');
            
            // Send notifications to selected classes in the background
            notificationService.sendContestNotification(contest, contest.allowedClasses)
                .then(result => {
                    if (result.success) {
                        console.log(`Private contest notifications sent successfully: ${result.stats.successful}/${result.stats.totalStudents} emails sent`);
                    } else {
                        console.error('Failed to send private contest notifications:', result.message);
                    }
                })
                .catch(error => {
                    console.error('Error sending private contest notifications:', error);
                });
        } else if (contest.visibility === 'public') {
            console.log('Sending email notifications for public contest...');
            
            // Send notifications to all students in the background
            notificationService.sendPublicContestNotification(contest)
                .then(result => {
                    if (result.success) {
                        console.log(`Public contest notifications sent successfully: ${result.stats.successful}/${result.stats.totalStudents} emails sent`);
                    } else {
                        console.error('Failed to send public contest notifications:', result.message);
                    }
                })
                .catch(error => {
                    console.error('Error sending public contest notifications:', error);
                });
        }

        let message = 'Contest created successfully';
        if (contest.visibility === 'private' && contest.allowedClasses && contest.allowedClasses.length > 0) {
            message += '. Email notifications are being sent to students in selected classes.';
        } else if (contest.visibility === 'public') {
            message += '. Email notifications are being sent to all students.';
        }

        res.status(201).json({
            success: true,
            message,
            data: contest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private (Teacher/Admin)
export const updateContest = async (req, res) => {
    try {
        let contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check ownership
        if (contest.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this contest'
            });
        }

        contest = await Contest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Contest updated successfully',
            data: contest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private (Teacher/Admin)
export const deleteContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check ownership
        if (contest.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this contest'
            });
        }

        await contest.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Contest deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Register for contest
// @route   POST /api/contests/:id/register
// @access  Private
export const registerForContest = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check if already registered
        const alreadyRegistered = contest.participants.some(
            p => p.user.toString() === req.user.id
        );

        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                message: 'Already registered for this contest'
            });
        }

        // Check max participants
        if (contest.maxParticipants && contest.participants.length >= contest.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'Contest is full'
            });
        }

        contest.participants.push({ user: req.user.id });
        await contest.save();

        res.status(200).json({
            success: true,
            message: 'Successfully registered for contest'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
    try {
        const { id } = req.params;

        const leaderboard = await Submission.aggregate([
            { $match: { contest: mongoose.Types.ObjectId(id), status: 'Accepted' } },
            {
                $group: {
                    _id: '$user',
                    totalScore: { $sum: '$score' },
                    problemsSolved: { $addToSet: '$problem' },
                    lastSubmission: { $max: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    user: {
                        id: '$userInfo._id',
                        name: '$userInfo.name',
                        email: '$userInfo.email'
                    },
                    totalScore: 1,
                    problemsSolved: { $size: '$problemsSolved' },
                    lastSubmission: 1
                }
            },
            { $sort: { totalScore: -1, problemsSolved: -1, lastSubmission: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Download contest report with all student scores
// @route   GET /api/contests/:id/report
// @access  Private (Teacher/Admin)
export const downloadContestReport = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id)
            .populate('problems', 'title difficulty')
            .populate('participants.user', 'name email');

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Get all submissions for this contest
        const submissions = await Submission.find({ contest: contest._id })
            .populate('user', 'name email')
            .populate('problem', 'title')
            .sort({ user: 1, problem: 1, createdAt: -1 });

        // Calculate scores for each participant
        const participantScores = {};
        
        contest.participants.forEach(participant => {
            const userId = participant.user._id.toString();
            participantScores[userId] = {
                name: participant.user.name,
                email: participant.user.email,
                totalScore: 0,
                problemScores: {},
                submissionCount: 0,
                acceptedCount: 0
            };
        });

        // Process submissions to calculate best scores per problem
        submissions.forEach(submission => {
            const userId = submission.user._id.toString();
            const problemId = submission.problem._id.toString();
            
            if (participantScores[userId]) {
                participantScores[userId].submissionCount++;
                
                if (submission.status === 'Accepted') {
                    // Only count the first accepted submission for each problem
                    if (!participantScores[userId].problemScores[problemId]) {
                        participantScores[userId].problemScores[problemId] = {
                            title: submission.problem.title,
                            score: submission.score || 100,
                            status: 'Accepted',
                            submittedAt: submission.createdAt
                        };
                        participantScores[userId].acceptedCount++;
                        participantScores[userId].totalScore += (submission.score || 100);
                    }
                } else {
                    // Track attempted but not solved problems
                    if (!participantScores[userId].problemScores[problemId]) {
                        participantScores[userId].problemScores[problemId] = {
                            title: submission.problem.title,
                            score: 0,
                            status: submission.status,
                            submittedAt: submission.createdAt
                        };
                    }
                }
            }
        });

        // Generate CSV content
        let csvContent = 'Rank,Name,Email,Total Score,Problems Solved,Total Submissions,';
        
        // Add problem columns
        contest.problems.forEach(problem => {
            csvContent += `"${problem.title}",`;
        });
        csvContent += '\n';

        // Sort participants by total score (descending)
        const sortedParticipants = Object.values(participantScores)
            .sort((a, b) => b.totalScore - a.totalScore);

        // Add participant data
        sortedParticipants.forEach((participant, index) => {
            csvContent += `${index + 1},"${participant.name}","${participant.email}",${participant.totalScore},${participant.acceptedCount},${participant.submissionCount},`;
            
            // Add problem scores
            contest.problems.forEach(problem => {
                const problemScore = participant.problemScores[problem._id.toString()];
                csvContent += `${problemScore ? problemScore.score : 0},`;
            });
            csvContent += '\n';
        });

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${contest.title}_report.csv"`);
        
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Send contest notifications manually
// @route   POST /api/contests/:id/notify
// @access  Private (Teacher/Admin)
export const sendContestNotifications = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check ownership
        if (contest.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send notifications for this contest'
            });
        }

        let result;

        if (contest.visibility === 'private') {
            if (!contest.allowedClasses || contest.allowedClasses.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Private contest must have assigned classes to send notifications'
                });
            }

            result = await notificationService.sendContestNotification(contest, contest.allowedClasses);
        } else if (contest.visibility === 'public') {
            result = await notificationService.sendPublicContestNotification(contest);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid contest visibility'
            });
        }

        if (result.success) {
            res.status(200).json({
                success: true,
                message: `Contest notifications sent successfully to ${contest.visibility} contest`,
                data: result.stats
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Test email configuration
// @route   GET /api/contests/test-email
// @access  Private (Teacher/Admin)
export const testEmailConfig = async (req, res) => {
    try {
        const result = await notificationService.validateEmailConfig();
        
        if (result.success) {
            // Send a test email to the requesting user
            const testResult = await notificationService.sendIndividualNotification(
                req.user.email,
                'Code-E-Pariksha - Email Configuration Test',
                `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>✅ Email Configuration Test Successful!</h2>
                    <p>Hello ${req.user.name},</p>
                    <p>This is a test email to confirm that your Code-E-Pariksha email configuration is working correctly.</p>
                    <p>You can now send contest notifications to students.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This test was initiated from the Code-E-Pariksha admin panel.
                    </p>
                </div>
                `
            );

            if (testResult.success) {
                res.status(200).json({
                    success: true,
                    message: 'Email configuration is working. Test email sent to your address.'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Email configuration validation passed, but failed to send test email',
                    error: testResult.error
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get student submissions for a contest
// @route   GET /api/contests/:id/student/:studentId/submissions
// @access  Private (Teacher/Admin)
export const getStudentContestSubmissions = async (req, res) => {
    try {
        const { id: contestId, studentId } = req.params;

        // Verify contest exists
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Get all submissions for this student in this contest
        const submissions = await Submission.find({ 
            contest: contestId, 
            user: studentId 
        })
            .populate('user', 'name email')
            .populate('problem', 'title difficulty')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: submissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
