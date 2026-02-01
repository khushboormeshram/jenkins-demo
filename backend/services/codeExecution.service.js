import fetch from 'node-fetch';

// Judge0 API URL - configurable via environment variable
// No default fallback - must be explicitly configured
const getJudge0ApiUrl = () => {
    return process.env.JUDGE0_API_URL;
};

// Language ID mapping for Judge0
const LANGUAGE_MAP = {
    cpp: 54,      // C++ (GCC 9.2.0)
    c: 50,        // C (GCC 9.2.0)
    java: 62,     // Java (OpenJDK 13.0.1)
    python: 71,   // Python (3.8.1)
    javascript: 63, // JavaScript (Node.js 12.14.0)
    nasm: 45,     // Assembly (NASM 2.14.02)
    sql: 82       // SQL (SQLite 3.27.2)
};

/**
 * Poll Judge0 for submission result
 * @param {string} submissionToken - Token from initial submission
 * @param {number} maxAttempts - Max polling attempts
 * @param {number} delayMs - Delay between polls in milliseconds (fixed 500ms)
 * @returns {Promise<Object>} Execution result
 */
const pollForResult = async (JUDGE0_API_URL, submissionToken, maxAttempts = 60, delayMs = 500) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Poll immediately first, then wait 500ms between polls
        if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        try {
            const resultResponse = await fetch(
                `${JUDGE0_API_URL}/submissions/${submissionToken}?base64_encoded=true`,
                { method: 'GET' }
            );

            if (!resultResponse.ok) {
                continue;
            }

            const result = await resultResponse.json();

            // Check if execution is complete (status >= 3)
            if (result.status?.id >= 3) {
                // Decode output
                const output = result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '';
                const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '';
                const compileOutput = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString() : '';

                return {
                    status: getStatusText(result.status.id),
                    statusId: result.status.id,
                    output,
                    stderr,
                    compileOutput,
                    time: parseFloat(result.time) || 0,
                    memory: parseInt(result.memory) || 0,
                    message: result.message || result.status.description
                };
            }
        } catch (err) {
            // Continue polling
        }
    }

    throw new Error('Code execution timeout: Results not received within timeout period');
};
/**
 * Execute code using Judge0 API with async polling
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @param {string} input - Standard input
 * @param {number} timeLimit - Time limit in seconds
 * @param {number} memoryLimit - Memory limit in KB
 * @returns {Promise<Object>} Execution result
 */
export const executeCode = async (code, language, input = '', timeLimit = 2, memoryLimit = 256000) => {
    try {
        // Check if Judge0 API URL is configured
        const JUDGE0_API_URL = getJudge0ApiUrl();
        if (!JUDGE0_API_URL) {
            throw new Error('Judge0 API URL is not configured. Please set JUDGE0_API_URL in your environment variables.');
        }

        const languageId = LANGUAGE_MAP[language];

        if (!languageId) {
            throw new Error(`Unsupported language: ${language}`);
        }

        // Convert | separator to newlines for proper input formatting
        const formattedInput = input.replace(/\s*\|\s*/g, '\n');

        // Encode to base64
        const encodedCode = Buffer.from(code).toString('base64');
        const encodedInput = Buffer.from(formattedInput).toString('base64');

        // Submit code WITHOUT waiting (wait=false)
        const submissionResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_code: encodedCode,
                language_id: languageId,
                stdin: encodedInput,
                cpu_time_limit: timeLimit,
                memory_limit: memoryLimit
            })
        });

        if (!submissionResponse.ok) {
            const errorText = await submissionResponse.text();
            throw new Error(`Judge0 API error (${submissionResponse.status}): ${submissionResponse.statusText}. ${errorText}`);
        }

        const submissionData = await submissionResponse.json();
        const submissionToken = submissionData.token;

        console.log('Submission created with token:', submissionToken);

        // Poll for results
        return await pollForResult(JUDGE0_API_URL, submissionToken);
    } catch (error) {
        throw new Error(`Code execution failed: ${error.message}`);
    }
};

/**
 * Run code against multiple test cases
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of {input, output}
 * @returns {Promise<Object>} Test results
 */
export const runTestCases = async (code, language, testCases) => {
    try {
        // Run all test cases in parallel for speed
        const resultPromises = testCases.map(testCase =>
            executeCode(code, language, testCase.input)
        );

        const executionResults = await Promise.all(resultPromises);

        let passed = 0;
        let failed = 0;
        const results = [];

        executionResults.forEach((result, idx) => {
            const testCase = testCases[idx];
            const isCorrect = result.output.trim() === testCase.output.trim();

            if (result.statusId === 3 && isCorrect) {
                passed++;
            } else {
                failed++;
            }

            results.push({
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput: result.output,
                status: result.status,
                isCorrect,
                time: result.time,
                memory: result.memory,
                error: result.stderr || result.compileOutput
            });
        });

        return {
            totalTests: testCases.length,
            passed,
            failed,
            results
        };
    } catch (error) {
        throw new Error(`Test execution failed: ${error.message}`);
    }
};

/**
 * Get status text from Judge0 status ID
 */
function getStatusText(statusId) {
    const statusMap = {
        1: 'In Queue',
        2: 'Processing',
        3: 'Accepted',
        4: 'Wrong Answer',
        5: 'Time Limit Exceeded',
        6: 'Compilation Error',
        7: 'Runtime Error (SIGSEGV)',
        8: 'Runtime Error (SIGXFSZ)',
        9: 'Runtime Error (SIGFPE)',
        10: 'Runtime Error (SIGABRT)',
        11: 'Runtime Error (NZEC)',
        12: 'Runtime Error (Other)',
        13: 'Internal Error',
        14: 'Exec Format Error'
    };

    return statusMap[statusId] || 'Unknown';
}

export default {
    executeCode,
    runTestCases
};
