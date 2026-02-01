import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password not required if Google OAuth
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    institution: {
        type: String,
        maxlength: [100, 'Institution name cannot be more than 100 characters']
    },
    rollNo: {
        type: String,
        trim: true,
        maxlength: [20, 'Roll number cannot be more than 20 characters'],
        sparse: true // Allows multiple null values, useful for teachers/admins who don't have roll numbers
    },
    prn: {
        type: String,
        trim: true,
        maxlength: [20, 'PRN cannot be more than 20 characters'],
        sparse: true // Allows multiple null values
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Skip password hashing for Google OAuth users or if password is not modified
    if (!this.isModified('password') || !this.password) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
