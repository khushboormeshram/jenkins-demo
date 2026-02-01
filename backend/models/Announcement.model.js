import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Announcement title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Announcement content is required']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetAudience: {
        type: String,
        enum: ['all', 'students', 'teachers', 'specific'],
        default: 'all'
    },
    targetClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }]
}, {
    timestamps: true
});

// Index for faster queries
announcementSchema.index({ author: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1, isPublished: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
