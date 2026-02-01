import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    isHidden: {
        type: Boolean,
        default: false
    }
});

const inputFieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    label: {
        type: String,
        trim: true
    }
}, { _id: false });

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Problem title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Problem description is required']
    },
    // Optional image for the question
    image: {
        type: String, // URL or base64 string
        default: null
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'easy', 'medium', 'hard'],
        required: true
    },
    category: {
        type: String,
        enum: ['Algorithms', 'Database', 'Shell', 'Concurrency'],
        default: 'Algorithms'
    },
    // Question type: coding or mcq
    questionType: {
        type: String,
        enum: ['coding', 'mcq'],
        default: 'coding'
    },
    tags: [{
        type: String,
        trim: true
    }],
    constraints: {
        type: String
    },
    examples: [{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        },
        explanation: {
            type: String
        },
        imageUrl: {
            type: String,
            default: ''
        }
    }],
    inputFormat: {
        type: String
    },
    outputFormat: {
        type: String
    },
    sampleInput: {
        type: String
    },
    sampleOutput: {
        type: String
    },
    testCases: [testCaseSchema],
    inputFields: [inputFieldSchema], // Define input field names for the problem (e.g., [{name: 'n', label: 'n'}, {name: 'k', label: 'k'}, {name: 'array', label: 'array'}])
    
    // MCQ-specific fields
    mcqOptions: [{
        text: {
            type: String,
            required: true
        },
        isCorrect: {
            type: Boolean,
            default: false
        }
    }],
    mcqExplanation: {
        type: String
    },
    
    timeLimit: {
        type: Number,
        default: 2000 // milliseconds
    },
    memoryLimit: {
        type: Number,
        default: 256 // MB
    },
    starterCode: {
        cpp: String,
        java: String,
        python: String,
        c: String
    },
    driverCode: {
        cpp: String,
        java: String,
        python: String,
        javascript: String
    },
    solution: {
        type: String,
        select: false // Don't return solution by default
    },
    hints: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    acceptedSubmissions: {
        type: Number,
        default: 0
    },
    totalSubmissions: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
problemSchema.index({ difficulty: 1, category: 1, tags: 1 });
problemSchema.index({ title: 'text', description: 'text' });

// Virtual for acceptance rate
problemSchema.virtual('acceptanceRate').get(function () {
    if (this.totalSubmissions === 0) return 0;
    return ((this.acceptedSubmissions / this.totalSubmissions) * 100).toFixed(2);
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
