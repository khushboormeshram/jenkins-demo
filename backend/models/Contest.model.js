import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Contest title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rules: {
        type: String
    },
    prizes: {
        type: String
    },
    bannerImage: {
        type: String
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    allowedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    status: {
        type: String,
        enum: ['upcoming', 'active', 'ended'],
        default: 'upcoming'
    },
    maxParticipants: {
        type: Number
    },
    allowedLanguages: [{
        type: String,
        enum: ['python', 'cpp', 'java', 'c', 'nasm', 'sql', 'shell script']
    }]
}, {
    timestamps: true
});

// Update status based on time
contestSchema.methods.updateStatus = function () {
    const now = new Date();
    if (now < this.startTime) {
        this.status = 'upcoming';
    } else if (now >= this.startTime && now <= this.endTime) {
        this.status = 'active';
    } else {
        this.status = 'ended';
    }
};

// Index for faster queries
contestSchema.index({ startTime: 1, endTime: 1, status: 1 });

const Contest = mongoose.model('Contest', contestSchema);

export default Contest;
