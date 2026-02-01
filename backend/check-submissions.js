import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Problem from './models/Problem.model.js';
import Submission from './models/Submission.model.js';
import User from './models/User.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function checkSubmissions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');
        
        // Get recent submissions
        const submissions = await Submission.find({})
            .populate('problem', 'title testCases')
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
        
        console.log(`Found ${submissions.length} recent submissions:\n`);
        
        for (const sub of submissions) {
            console.log(`Submission ID: ${sub._id}`);
            console.log(`User: ${sub.user?.name || 'Unknown'}`);
            console.log(`Problem: ${sub.problem?.title || 'Unknown'}`);
            console.log(`Status: ${sub.status}`);
            console.log(`Score: ${sub.score}`);
            console.log(`Test Cases Passed: ${sub.testCasesPassed}/${sub.totalTestCases}`);
            
            if (sub.problem?.testCases) {
                const visibleTests = sub.problem.testCases.filter(tc => !tc.isHidden);
                const hiddenTests = sub.problem.testCases.filter(tc => tc.isHidden);
                console.log(`Problem Test Cases: ${visibleTests.length} visible, ${hiddenTests.length} hidden`);
                
                // Analyze if this should be "Partially Correct"
                if (sub.testCasesPassed > visibleTests.length && sub.testCasesPassed < sub.totalTestCases) {
                    console.log(`⚠️  This should be "Partially Correct" but is "${sub.status}"`);
                }
            }
            
            console.log(`Created: ${sub.createdAt}`);
            console.log('---\n');
        }
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSubmissions();