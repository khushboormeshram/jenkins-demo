import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Problem from './models/Problem.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function checkDriverCode() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const problem = await Problem.findOne({ title: "Two Sum" });
        
        if (problem) {
            console.log('\nProblem:', problem.title);
            console.log('Has driverCode?', !!problem.driverCode);
            console.log('\nDriver Code:');
            console.log('- C++:', problem.driverCode?.cpp ? 'YES' : 'NO');
            console.log('- Java:', problem.driverCode?.java ? 'YES' : 'NO');
            console.log('- Python:', problem.driverCode?.python ? 'YES' : 'NO');
            console.log('- JavaScript:', problem.driverCode?.javascript ? 'YES' : 'NO');
            
            if (problem.driverCode?.javascript) {
                console.log('\nJavaScript Driver Code:');
                console.log(problem.driverCode.javascript);
            }
        } else {
            console.log('Problem not found');
        }
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDriverCode();
