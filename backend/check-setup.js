// Quick setup checker
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

console.log('🔍 Checking Code-E-Pariksha Backend Setup...\n');

// Check 1: Node.js version
console.log('✓ Node.js:', process.version);

// Check 2: .env file
const envExists = fs.existsSync('.env');
console.log(envExists ? '✓ .env file exists' : '✗ .env file missing - copy from .env.example');

// Check 3: node_modules
const modulesExist = fs.existsSync('node_modules');
console.log(modulesExist ? '✓ Dependencies installed' : '✗ Run: npm install');

// Check 4: MongoDB
try {
    await execAsync('mongod --version');
    console.log('✓ MongoDB installed locally');
} catch (error) {
    console.log('⚠ MongoDB not found locally - use MongoDB Atlas cloud option');
}

console.log('\n📋 Next Steps:');
console.log('1. Ensure MongoDB is running (or use Atlas)');
console.log('2. Run: npm run dev');
console.log('3. Test: http://localhost:5000/api/health');
