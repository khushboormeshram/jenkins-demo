import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    // Question type to determine submission format
    questionType: {
        type: String,
        enum: ['coding', 'mcq'],
        default: 'coding'
    },
    // Coding submission fields
    code: {
        type: String,
        required: function() { return this.questionType === 'coding'; }
    },
    language: {
        type: String,
        required: function() { return this.questionType === 'coding'; },
        enum: ['cpp', 'c', 'java', 'python', 'javascript', 'nasm', 'sql', 'shell script']
    },
    // MCQ submission fields
    mcqAnswer: {
        type: Number, // Index of selected option
        required: function() { return this.questionType === 'mcq'; }
    },
    isCorrect: {
        type: Boolean,
        required: function() { return this.questionType === 'mcq'; }
    },
    status: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Partially Correct', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'],
        default: 'Pending'
    },
    executionTime: {
        type: Number // in milliseconds
    },
    memory: {
        type: Number // in KB
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    totalTestCases: {
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String
    },
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest'
    },
    score: {
        type: Number,
        default: 0
    },
    testResults: [{
        input: String,
        expectedOutput: String,
        actualOutput: String,
        isCorrect: Boolean,
        time: Number,
        memory: Number,
        error: String,
        status: String
    }]
}, {
    timestamps: true
});

// Index for faster queries
submissionSchema.index({ user: 1, problem: 1, createdAt: -1 });
submissionSchema.index({ contest: 1, user: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
