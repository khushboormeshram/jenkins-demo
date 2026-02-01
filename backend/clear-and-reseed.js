import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Problem from './models/Problem.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function clearAndReseed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Delete all problems
        const deleteResult = await Problem.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} problems`);
        
        mongoose.connection.close();
        console.log('Database connection closed');
        console.log('\nNow run: node backend/seed-problems.js');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

clearAndReseed();
