import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Problem from './models/Problem.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function checkTestCases() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');
        
        // Get the problem that has recent submissions
        const problem = await Problem.findById("694702ba0317ec5b102cf663");
        
        if (problem) {
            console.log(`Problem: ${problem.title}`);
            console.log(`Total test cases: ${problem.testCases?.length || 0}\n`);
            
            problem.testCases?.forEach((tc, idx) => {
                console.log(`Test Case ${idx + 1}:`);
                console.log(`  isHidden: ${tc.isHidden || false}`);
                console.log(`  input: "${tc.input}"`);
                console.log(`  output: "${tc.output}"`);
                console.log('---');
            });
            
            const visibleCount = problem.testCases?.filter(tc => !tc.isHidden).length || 0;
            const hiddenCount = problem.testCases?.filter(tc => tc.isHidden).length || 0;
            
            console.log(`\nSummary:`);
            console.log(`  Visible test cases: ${visibleCount}`);
            console.log(`  Hidden test cases: ${hiddenCount}`);
            console.log(`  Total: ${visibleCount + hiddenCount}`);
        } else {
            console.log('Problem not found');
        }
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTestCases();