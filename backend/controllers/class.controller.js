import Class from '../models/Class.model.js';
import User from '../models/User.model.js';
import Submission from '../models/Submission.model.js';

// @desc    Get all classes for teacher
// @route   GET /api/classes
// @access  Private (Teacher)
export const getClasses = async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user.id })
            .populate('students', 'name email rollNo prn avatar')
            .populate('assignments.problem', 'title difficulty')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private (Teacher)
export const getClass = async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id)
            .populate('students', 'name email rollNo prn avatar')
            .populate('assignments.problem', 'title difficulty tags')
            .populate('contests', 'title startTime endTime status');

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Check authorization
        if (classData.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this class'
            });
        }

        res.status(200).json({
            success: true,
            data: classData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create class
// @route   POST /api/classes
// @access  Private (Teacher)
export const createClass = async (req, res) => {
    try {
        const classData = {
            ...req.body,
            teacher: req.user.id
        };

        const newClass = await Class.create(classData);

        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            data: newClass
        });
    } catch (error) {
        // Handle duplicate class code error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.code) {
            return res.status(400).json({
                success: false,
                message: `Class code "${req.body.code}" already exists. Please use a different class code.`
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Teacher)
export const updateClass = async (req, res) => {
    try {
        let classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Check authorization
        if (classData.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this class'
            });
        }

        classData = await Class.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Class updated successfully',
            data: classData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Teacher)
export const deleteClass = async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Check authorization
        if (classData.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this class'
            });
        }

        await classData.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Class deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add students to class by email
// @route   POST /api/classes/:id/students
// @access  Private (Teacher)
export const addStudents = async (req, res) => {
    try {
        const { emails, email, rollNo } = req.body;
        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Check authorization
        if (classData.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this class'
            });
        }

        let emailsToAdd = [];
        
        // Handle single email (from AddStudentForm)
        if (email) {
            emailsToAdd = [email];
        }
        
        // Handle multiple emails (from bulk add)
        if (emails && Array.isArray(emails)) {
            emailsToAdd = emails;
        }

        if (emailsToAdd.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No emails provided'
            });
        }

        // Find users by email with student role
        const students = await User.find({
            email: { $in: emailsToAdd },
            role: 'student'
        });

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No valid student accounts found with the provided emails'
            });
        }

        // Track results
        const results = {
            added: [],
            alreadyEnrolled: [],
            notFound: []
        };

        const foundEmails = students.map(s => s.email);
        
        // Check which emails were not found
        emailsToAdd.forEach(email => {
            if (!foundEmails.includes(email)) {
                results.notFound.push(email);
            }
        });

        // Add students (avoid duplicates) and update roll number if provided
        for (const student of students) {
            if (!classData.students.includes(student._id)) {
                classData.students.push(student._id);
                
                // Auto-generate PRN from email if not already set
                if (!student.prn && student.email.includes('@')) {
                    const emailParts = student.email.split('@');
                    const potentialPrn = emailParts[0];
                    // Check if the email prefix looks like a PRN (numeric)
                    if (/^\d+$/.test(potentialPrn)) {
                        student.prn = potentialPrn;
                        await student.save();
                    }
                }
                
                // Update roll number if provided (only for single student addition)
                if (email && rollNo && student.email === email) {
                    student.rollNo = rollNo;
                    await student.save();
                }
                
                results.added.push({
                    name: student.name,
                    email: student.email,
                    rollNo: student.rollNo,
                    prn: student.prn
                });
            } else {
                results.alreadyEnrolled.push({
                    name: student.name,
                    email: student.email,
                    rollNo: student.rollNo,
                    prn: student.prn
                });
            }
        }

        await classData.save();

        // Prepare response message
        let message = '';
        if (results.added.length > 0) {
            message += `${results.added.length} student(s) added successfully. `;
        }
        if (results.alreadyEnrolled.length > 0) {
            message += `${results.alreadyEnrolled.length} student(s) were already enrolled. `;
        }
        if (results.notFound.length > 0) {
            message += `${results.notFound.length} email(s) not found or not student accounts.`;
        }

        res.status(200).json({
            success: true,
            message: message.trim(),
            data: {
                class: classData,
                results
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Teacher)
export const removeStudent = async (req, res) => {
    try {
        const { id, studentId } = req.params;
        const classData = await Class.findById(id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Check authorization
        if (classData.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this class'
            });
        }

        classData.students = classData.students.filter(
            s => s.toString() !== studentId
        );

        await classData.save();

        res.status(200).json({
            success: true,
            message: 'Student removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get class analytics
// @route   GET /api/classes/:id/analytics
// @access  Private (Teacher)
export const getClassAnalytics = async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Check authorization
        if (classData.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this class'
            });
        }

        // Get submission stats for all students
        const studentStats = await Promise.all(
            classData.students.map(async (studentId) => {
                const totalSubmissions = await Submission.countDocuments({ user: studentId });
                const acceptedSubmissions = await Submission.countDocuments({
                    user: studentId,
                    status: 'Accepted'
                });
                const solvedProblems = await Submission.distinct('problem', {
                    user: studentId,
                    status: 'Accepted'
                });

                const student = await User.findById(studentId).select('name email');

                return {
                    student,
                    totalSubmissions,
                    acceptedSubmissions,
                    solvedProblems: solvedProblems.length,
                    acceptanceRate: totalSubmissions > 0
                        ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)
                        : 0
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                className: classData.name,
                totalStudents: classData.students.length,
                studentStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get class students
// @route   GET /api/classes/:id/students
// @access  Private (Teacher)
export const getClassStudents = async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id)
            .populate('students', 'name email rollNo prn avatar');

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Check authorization
        if (classData.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this class'
            });
        }

        res.status(200).json({
            success: true,
            data: classData.students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add bulk students by email
// @route   POST /api/classes/:id/students/bulk
// @access  Private (Teacher)
export const addBulkStudents = async (req, res) => {
    try {
        const { emails } = req.body;
        
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of email addresses'
            });
        }

        // Clean and validate emails
        const cleanEmails = emails
            .map(email => email.trim().toLowerCase())
            .filter(email => email && email.includes('@'));

        if (cleanEmails.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid email addresses provided'
            });
        }

        // Use the existing addStudents function logic
        req.body.emails = cleanEmails;
        return addStudents(req, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get teacher dashboard overview
// @route   GET /api/classes/dashboard/overview
// @access  Private (Teacher)
export const getDashboardOverview = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // Get total classes
        const totalClasses = await Class.countDocuments({ teacher: teacherId });

        // Get total students across all classes
        const classes = await Class.find({ teacher: teacherId });
        const allStudents = new Set();
        classes.forEach(cls => {
            cls.students.forEach(student => allStudents.add(student.toString()));
        });

        // Get recent submissions from students
        const recentSubmissions = await Submission.find({
            user: { $in: Array.from(allStudents) }
        })
            .populate('user', 'name')
            .populate('problem', 'title')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get pending submissions count
        const pendingSubmissions = await Submission.countDocuments({
            user: { $in: Array.from(allStudents) },
            status: 'Pending'
        });

        res.status(200).json({
            success: true,
            data: {
                totalClasses,
                totalStudents: allStudents.size,
                pendingSubmissions,
                recentSubmissions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};