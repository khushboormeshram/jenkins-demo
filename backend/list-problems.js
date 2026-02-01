import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Problem from './models/Problem.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function listProblems() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');
        
        const problems = await Problem.find({}).select('_id title difficulty');
        
        console.log(`Found ${problems.length} problems:\n`);
        
        problems.forEach((p, idx) => {
            console.log(`${idx + 1}. ${p.title} (${p.difficulty})`);
            console.log(`   ID: ${p._id}`);
        });
        
        console.log('\n\nTo access a problem, go to:');
        console.log(`http://localhost:5173/practice/${problems[0]._id}/workspace`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listProblems();
