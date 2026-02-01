import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Class name is required'],
        trim: true,
        maxlength: [100, 'Class name cannot exceed 100 characters']
    },
    code: {
        type: String,
        required: [true, 'Class code is required'],
        trim: true,
        unique: true,
        uppercase: true,
        maxlength: [20, 'Class code cannot exceed 20 characters'],
        index: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    assignments: [{
        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem'
        },
        dueDate: Date,
        assignedAt: {
            type: Date,
            default: Date.now
        }
    }],
    contests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    academicYear: {
        type: String
    },
    semester: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
classSchema.index({ teacher: 1, isActive: 1 });

const Class = mongoose.model('Class', classSchema);

export default Class;
