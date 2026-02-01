import Announcement from '../models/Announcement.model.js';
import Class from '../models/Class.model.js';

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
export const getAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = { isPublished: true };

        // Filter based on user role and targeting
        if (userRole === 'student') {
            // Get classes the student is in
            const studentClasses = await Class.find({ students: userId }).select('_id');
            const classIds = studentClasses.map(c => c._id);

            query.$or = [
                { targetAudience: 'all' },
                { targetAudience: 'students' },
                { targetClasses: { $in: classIds } },
                { targetUsers: userId }
            ];
        } else if (userRole === 'teacher') {
            query.$or = [
                { targetAudience: 'all' },
                { targetAudience: 'teachers' },
                { author: userId },
                { targetUsers: userId }
            ];
        }

        // Filter out expired announcements
        query.$or = [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ];

        const announcements = await Announcement.find(query)
            .populate('author', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ priority: -1, createdAt: -1 });

        const count = await Announcement.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                announcements,
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

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
export const getAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('author', 'name email')
            .populate('targetClasses', 'name')
            .populate('targetUsers', 'name email');

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.status(200).json({
            success: true,
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Teacher/Admin)
export const createAnnouncement = async (req, res) => {
    try {
        const announcementData = {
            ...req.body,
            author: req.user.id
        };

        const announcement = await Announcement.create(announcementData);

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Teacher/Admin)
export const updateAnnouncement = async (req, res) => {
    try {
        let announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        // Check authorization
        if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this announcement'
            });
        }

        announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Announcement updated successfully',
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Teacher/Admin)
export const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        // Check authorization
        if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this announcement'
            });
        }

        await announcement.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
