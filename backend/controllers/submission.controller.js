import Submission from '../models/Submission.model.js';
import Problem from '../models/Problem.model.js';
import { runTestCases } from '../services/codeExecution.service.js';
import mongoose from 'mongoose';

// @desc    Run code against sample test cases (no submission)
// @route   POST /api/submissions/run
// @access  Private
export const runCode = async (req, res) => {
    try {
        const { problemId, code, language, testCaseIndex, customTestCases } = req.body;

        // Validate problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Get test cases - use custom test cases if provided, otherwise use problem test cases
        let testCases;
        
        if (customTestCases && Array.isArray(customTestCases)) {
            // Use custom test cases from frontend
            testCases = customTestCases;
            console.log('RUN: Using custom test cases from frontend:', testCases.length);
            console.log('RUN: Custom test cases:', testCases.map(tc => ({ input: tc.input, output: tc.output })));
        } else {
            // Use problem test cases from database
            testCases = problem.testCases || [];
            console.log('Total test cases in problem:', testCases.length);
            console.log('testCaseIndex provided:', testCaseIndex);
            
            if (typeof testCaseIndex === 'number' && testCaseIndex >= 0 && testCaseIndex < testCases.length) {
                testCases = [testCases[testCaseIndex]];
                console.log('Running single test case at index:', testCaseIndex);
            } else {
                // For run, only use visible (non-hidden) test cases
                const originalLength = testCases.length;
                testCases = testCases.filter(tc => !tc.isHidden);
                console.log('Filtered test cases from', originalLength, 'to', testCases.length, '(removed hidden)');
            }
        }

        if (testCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No test cases available for this problem'
            });
        }

        console.log('Running code against', testCases.length, 'test cases');
        // Run code against test cases
        const testResults = await runTestCases(code, language, testCases);
        console.log('Test results:', testResults);

        res.status(200).json({
            success: true,
            data: {
                results: testResults.results,
                passed: testResults.passed,
                failed: testResults.failed,
                totalTests: testResults.totalTests
            }
        });
    } catch (error) {
        console.error('Run code error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to run code'
        });
    }
};

// @desc    Submit code for a problem or MCQ answer
// @route   POST /api/submissions
// @access  Private
export const createSubmission = async (req, res) => {
    try {
        const { problemId, contestId, code, language, customTestCases, mcqAnswer, isCorrect, questionType } = req.body;

        // Validate problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Determine submission type
        const submissionType = questionType || problem.questionType || 'coding';

        // Handle MCQ submissions
        if (submissionType === 'mcq') {
            console.log('Processing MCQ submission:', { mcqAnswer, isCorrect, questionType });
            
            const submissionData = {
                user: req.user.id,
                problem: problemId,
                questionType: 'mcq',
                mcqAnswer: mcqAnswer,
                isCorrect: isCorrect,
                status: isCorrect ? 'Accepted' : 'Wrong Answer',
                score: isCorrect ? 100 : 0,
                testCasesPassed: isCorrect ? 1 : 0,
                totalTestCases: 1
            };

            // Add contest if provided
            if (contestId) {
                submissionData.contest = contestId;
            }

            console.log('Creating MCQ submission with data:', submissionData);
            const submission = await Submission.create(submissionData);
            console.log('MCQ submission created successfully:', submission._id);

            // Update problem statistics
            await Problem.findByIdAndUpdate(problemId, {
                $inc: {
                    totalSubmissions: 1,
                    acceptedSubmissions: isCorrect ? 1 : 0
                }
            });

            return res.status(201).json({
                success: true,
                message: 'MCQ submission saved successfully',
                data: {
                    ...submission.toObject(),
                    passedTests: isCorrect ? 1 : 0,
                    totalTests: 1
                }
            });
        }

        // Handle coding submissions (existing logic)
        // For submissions, ALWAYS use all test cases from the problem (including hidden ones)
        // Custom test cases should only be used for run operations, not submissions
        let testCasesToUse = problem.testCases || [];
        
        console.log('SUBMIT: Total test cases in problem:', testCasesToUse.length);
        console.log('SUBMIT: Hidden test cases:', testCasesToUse.filter(tc => tc.isHidden).length);
        console.log('SUBMIT: Visible test cases:', testCasesToUse.filter(tc => !tc.isHidden).length);

        // Create submission with pending status
        const submissionData = {
            user: req.user.id,
            problem: problemId,
            questionType: 'coding',
            code,
            language,
            status: 'Pending',
            totalTestCases: testCasesToUse.length || 0
        };

        // Add contest if provided
        if (contestId) {
            submissionData.contest = contestId;
        }

        const submission = await Submission.create(submissionData);

        // Run code against test cases synchronously for immediate feedback  
        if (testCasesToUse && testCasesToUse.length > 0) {
            console.log('SUBMIT: Using test cases:', testCasesToUse.length);
            console.log('SUBMIT: Test cases breakdown:');
            console.log('  - Total:', testCasesToUse.length);
            console.log('  - Hidden:', testCasesToUse.filter(tc => tc.isHidden).length);
            console.log('  - Visible:', testCasesToUse.filter(tc => !tc.isHidden).length);
            console.log('Test cases:', testCasesToUse.map((tc, idx) => ({ 
                index: idx, 
                input: tc.input, 
                output: tc.output, 
                isHidden: tc.isHidden || false 
            })));
            try {
                console.log('SUBMIT: About to run test cases with code execution...');
                const testResults = await runTestCases(code, language, testCasesToUse);
                console.log('SUBMIT: Test execution completed:', testResults);
                console.log('SUBMIT: Results array:', testResults.results);
                console.log('SUBMIT: Time values:', testResults.results?.map(r => ({ time: r.time, memory: r.memory })));
                
                // Determine status based on test results
                // Count visible and hidden test case results
                const visibleTestCases = testCasesToUse.filter(tc => !tc.isHidden);
                const hiddenTestCases = testCasesToUse.filter(tc => tc.isHidden);
                
                let visiblePassed = 0;
                let hiddenPassed = 0;
                
                testResults.results.forEach((result, index) => {
                    const testCase = testCasesToUse[index];
                    if (result.isCorrect) {
                        if (testCase.isHidden) {
                            hiddenPassed++;
                        } else {
                            visiblePassed++;
                        }
                    }
                });
                
                console.log('SUBMIT: Test case analysis:');
                console.log('  - Visible test cases:', visibleTestCases.length, 'passed:', visiblePassed);
                console.log('  - Hidden test cases:', hiddenTestCases.length, 'passed:', hiddenPassed);
                console.log('  - Total passed:', testResults.passed, 'out of', testResults.totalTests);
                console.log('  - Condition check: visiblePassed === visibleTestCases.length?', visiblePassed === visibleTestCases.length);
                console.log('  - Condition check: hiddenPassed > 0?', hiddenPassed > 0);
                
                let status;
                if (testResults.passed === testResults.totalTests) {
                    // All test cases passed
                    status = 'Accepted';
                    console.log('  - Status decision: Accepted (all tests passed)');
                } else if (visiblePassed === visibleTestCases.length && hiddenPassed > 0) {
                    // All visible test cases passed + some hidden test cases passed
                    status = 'Partially Correct';
                    console.log('  - Status decision: Partially Correct');
                } else {
                    // Not all visible test cases passed OR no hidden test cases passed
                    status = 'Wrong Answer';
                    console.log('  - Status decision: Wrong Answer');
                }

                // Calculate average time safely (convert string times to numbers)
                const totalTime = testResults.results.reduce((sum, r) => {
                    const timeValue = parseFloat(r.time) || 0;
                    return sum + timeValue;
                }, 0);
                const avgTime = testResults.results.length > 0 ? totalTime / testResults.results.length : 0;
                
                // Calculate max memory safely
                const memoryValues = testResults.results.map(r => r.memory || 0).filter(m => !isNaN(m));
                const maxMemory = memoryValues.length > 0 ? Math.max(...memoryValues) : 0;
                
                console.log('SUBMIT: Calculated avgTime:', avgTime, 'maxMemory:', maxMemory);

                // Ensure all numeric values are valid
                const safeExecutionTime = isNaN(avgTime) ? 0 : avgTime;
                const safeMemory = isNaN(maxMemory) ? 0 : maxMemory;
                const safeScore = isNaN((testResults.passed / testResults.totalTests) * 100) ? 0 : (testResults.passed / testResults.totalTests) * 100;
                
                console.log('SUBMIT: Safe values - executionTime:', safeExecutionTime, 'memory:', safeMemory, 'score:', safeScore);

                // Update submission with results
                const updatedSubmission = await Submission.findByIdAndUpdate(submission._id, {
                    status,
                    testCasesPassed: testResults.passed || 0,
                    executionTime: safeExecutionTime,
                    memory: safeMemory,
                    score: safeScore,
                    testResults: testResults.results || []
                }, { new: true });

                // Update problem statistics
                await Problem.findByIdAndUpdate(problemId, {
                    $inc: {
                        totalSubmissions: 1,
                        acceptedSubmissions: (status === 'Accepted' || status === 'Partially Correct') ? 1 : 0
                    }
                });

                // Prepare test results for frontend - hide details of hidden test cases
                const testResultsForFrontend = testResults.results.map((result, index) => {
                    const originalTestCase = testCasesToUse[index];
                    const isHidden = originalTestCase?.isHidden || false;
                    
                    if (isHidden) {
                        // For hidden test cases, only send pass/fail status
                        return {
                            isCorrect: result.isCorrect,
                            passed: result.isCorrect,
                            isHidden: true,
                            testCaseNumber: index + 1,
                            // Don't send input, output, expected for hidden test cases
                            executionTime: result.time,
                            memory: result.memory,
                            status: result.status
                        };
                    } else {
                        // For visible test cases, send full details
                        return {
                            ...result,
                            isHidden: false,
                            testCaseNumber: index + 1
                        };
                    }
                });

                // Return results in format expected by frontend
                res.status(201).json({
                    success: true,
                    message: 'Submission evaluated successfully',
                    data: {
                        ...updatedSubmission.toObject(),
                        status: updatedSubmission.status,
                        passedTests: testResults.passed,
                        totalTests: testResults.totalTests,
                        testResults: testResultsForFrontend
                    }
                });
            } catch (error) {
                console.error('SUBMIT: Error during test execution:', error);
                console.error('SUBMIT: Error message:', error.message);
                console.error('SUBMIT: Error stack:', error.stack);
                
                // Update submission with error
                await Submission.findByIdAndUpdate(submission._id, {
                    status: 'Runtime Error',
                    errorMessage: error.message,
                    testResults: [{
                        error: error.message,
                        isCorrect: false,
                        status: 'Runtime Error'
                    }]
                });

                res.status(200).json({
                    success: true,
                    message: 'Submission evaluated with errors',
                    data: {
                        ...submission.toObject(),
                        status: 'Runtime Error',
                        passedTests: 0,
                        totalTests: testCasesToUse.length,
                        errorMessage: error.message
                    }
                });
            }
        } else {
            res.status(201).json({
                success: true,
                message: 'Submission created (no test cases to evaluate)',
                data: {
                    ...submission.toObject(),
                    passedTests: 0,
                    totalTests: 0
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all submissions (Teacher/Admin only)
// @route   GET /api/submissions
// @access  Private (Teacher/Admin)
export const getAllSubmissions = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const submissions = await Submission.find({})
            .populate('user', 'name email')
            .populate('problem', 'title difficulty questionType mcqOptions mcqExplanation')
            .populate('contest', 'title')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Submission.countDocuments({});

        res.status(200).json({
            success: true,
            data: {
                submissions,
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

// @desc    Get user submissions
// @route   GET /api/submissions/user/:userId
// @access  Private
export const getUserSubmissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Check authorization
        if (req.user.id !== userId && req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these submissions'
            });
        }

        const submissions = await Submission.find({ user: userId })
            .populate('problem', 'title difficulty')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Submission.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: {
                submissions,
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

// @desc    Get problem submissions
// @route   GET /api/submissions/problem/:problemId
// @access  Private (Teacher/Admin)
export const getProblemSubmissions = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const submissions = await Submission.find({ problem: problemId })
            .populate('user', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Submission.countDocuments({ problem: problemId });

        res.status(200).json({
            success: true,
            data: {
                submissions,
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

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
export const getSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('user', 'name email')
            .populate('problem', 'title difficulty questionType mcqOptions mcqExplanation')
            .populate('contest', 'title');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Check authorization
        if (submission.user._id.toString() !== req.user.id && req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this submission'
            });
        }

        res.status(200).json({
            success: true,
            data: submission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user's submission stats
// @route   GET /api/submissions/stats/user
// @access  Private
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await Submission.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalSubmissions = await Submission.countDocuments({ user: userId });
        const acceptedSubmissions = await Submission.countDocuments({
            user: userId,
            status: 'Accepted'
        });

        const solvedProblems = await Submission.distinct('problem', {
            user: userId,
            status: 'Accepted'
        });

        res.status(200).json({
            success: true,
            data: {
                totalSubmissions,
                acceptedSubmissions,
                solvedProblems: solvedProblems.length,
                byStatus: stats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update submission score manually
// @route   PUT /api/submissions/:id/score
// @access  Private (Teacher/Admin)
export const updateSubmissionScore = async (req, res) => {
    try {
        const { score } = req.body;
        const submissionId = req.params.id;

        // Validate score
        if (typeof score !== 'number' || score < 0 || score > 100) {
            return res.status(400).json({
                success: false,
                message: 'Score must be a number between 0 and 100'
            });
        }

        // Find and update submission
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Update the score
        submission.score = score;
        submission.manuallyScored = true;
        await submission.save();

        res.status(200).json({
            success: true,
            message: 'Score updated successfully',
            data: submission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
