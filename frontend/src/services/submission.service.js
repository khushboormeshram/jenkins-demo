import apiClient from './api';

class SubmissionService {
    // Run code against problem test cases
    async runCode({ problemId, code, language, testCaseIndex, customTestCases }) {
        const requestData = { 
            problemId, 
            code, 
            language
        };
        
        // Only include testCaseIndex if it's provided (to run specific test case)
        if (typeof testCaseIndex === 'number') {
            requestData.testCaseIndex = testCaseIndex;
        }
        
        // Include custom test cases if provided
        if (customTestCases) {
            requestData.customTestCases = customTestCases;
        }
        
        return await apiClient.post('/submissions/run', requestData);
    }

    // Submit solution for evaluation (supports both coding and MCQ)
    async submitSolution({ problemId, contestId, code, language, customTestCases, mcqAnswer, isCorrect, questionType }) {
        const requestData = { 
            problemId, 
            contestId
        };
        
        // Add coding-specific fields
        if (questionType === 'mcq') {
            requestData.mcqAnswer = mcqAnswer;
            requestData.isCorrect = isCorrect;
            requestData.questionType = questionType;
        } else {
            // Default to coding submission
            requestData.code = code;
            requestData.language = language;
            requestData.questionType = questionType || 'coding';
            
            // Include custom test cases if provided
            if (customTestCases) {
                requestData.customTestCases = customTestCases;
            }
        }
        
        return await apiClient.post('/submissions', requestData);
    }

    // Submit code for a problem (legacy method)
    async submitCode(submissionData) {
        return await apiClient.post('/submissions', submissionData);
    }

    // Get user submissions
    async getUserSubmissions(userId, page = 1, limit = 20) {
        return await apiClient.get(`/submissions/user/${userId}?page=${page}&limit=${limit}`);
    }

    // Get single submission
    async getSubmission(id) {
        return await apiClient.get(`/submissions/${id}`);
    }

    // Get user stats
    async getUserStats() {
        return await apiClient.get('/submissions/stats/user');
    }

    // Get all submissions (Teacher/Admin only)
    async getAllSubmissions(page = 1, limit = 50) {
        return await apiClient.get(`/submissions?page=${page}&limit=${limit}`);
    }

    // Get detailed submission by ID (Teacher/Admin only)
    async getSubmissionDetails(id) {
        return await apiClient.get(`/submissions/${id}`);
    }

    // Get problem submissions (Teacher/Admin only)
    async getProblemSubmissions(problemId, page = 1, limit = 20) {
        return await apiClient.get(`/submissions/problem/${problemId}?page=${page}&limit=${limit}`);
    }

    // Update submission score (Teacher/Admin only)
    async updateScore(submissionId, score) {
        return await apiClient.put(`/submissions/${submissionId}/score`, { score });
    }
}

export const submissionService = new SubmissionService();
export default submissionService;
