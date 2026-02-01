import Problem from '../models/Problem.model.js';

// @desc    Get all problems with filters
// @route   GET /api/problems
// @access  Public
export const getProblems = async (req, res) => {
    try {
        const { difficulty, category, tags, search, page = 1, limit = 15 } = req.query;

        // Build query
        const query = { isPublished: true };

        if (difficulty) query.difficulty = difficulty;
        if (category && category !== 'All Topics') query.category = category;
        if (tags) query.tags = { $in: tags.split(',') };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const problems = await Problem.find(query)
            .select('-testCases -solution')
            .populate('createdBy', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Problem.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                problems,
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

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
export const getProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id)
            .select('-solution')
            .populate('createdBy', 'name email');

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Only show sample test cases, hide hidden ones
        const problemData = problem.toObject();
        problemData.testCases = problem.testCases.filter(tc => !tc.isHidden);

        res.status(200).json({
            success: true,
            data: problemData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create problem
// @route   POST /api/problems
// @access  Private (Teacher/Admin)
export const createProblem = async (req, res) => {
    try {
        const problemData = {
            ...req.body,
            createdBy: req.user.id
        };

        const problem = await Problem.create(problemData);

        res.status(201).json({
            success: true,
            message: 'Problem created successfully',
            data: problem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private (Teacher/Admin)
export const updateProblem = async (req, res) => {
    try {
        let problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Since route middleware already ensures user is teacher/admin, 
        // allow any teacher/admin to update any problem
        console.log('User authorized to update problem');

        problem = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Problem updated successfully',
            data: problem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private (Teacher/Admin)
export const deleteProblem = async (req, res) => {
    try {
        console.log('Delete request received for problem ID:', req.params.id);
        console.log('User requesting delete:', req.user?.id, req.user?.role);
        
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            console.log('Problem not found:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        console.log('Problem found, created by:', problem.createdBy.toString());

        // Since route middleware already ensures user is teacher/admin, 
        // allow any teacher/admin to delete any problem
        console.log('User authorized to delete problem');

        await problem.deleteOne();
        console.log('Problem deleted successfully');

        res.status(200).json({
            success: true,
            message: 'Problem deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get problem statistics
// @route   GET /api/problems/stats
// @access  Public
export const getProblemStats = async (req, res) => {
    try {
        const stats = await Problem.aggregate([
            { $match: { isPublished: true } },
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 }
                }
            }
        ]);

        const tagStats = await Problem.aggregate([
            { $match: { isPublished: true } },
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                byDifficulty: stats,
                topTags: tagStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
