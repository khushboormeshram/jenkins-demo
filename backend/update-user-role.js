import mongoose from 'mongoose';
import User from './models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

const updateUserRole = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get email from command line argument
        const email = process.argv[2];
        const role = process.argv[3] || 'teacher';

        if (!email) {
            console.error('Usage: node update-user-role.js <email> [role]');
            console.error('Example: node update-user-role.js user@example.com teacher');
            process.exit(1);
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        console.log(`Current user: ${user.name} (${user.email})`);
        console.log(`Current role: ${user.role}`);
        
        user.role = role;
        await user.save();
        
        console.log(`✓ Successfully updated role to: ${role}`);
        console.log('\nPlease log out and log back in for changes to take effect.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

updateUserRole();
