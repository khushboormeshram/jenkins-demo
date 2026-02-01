import apiClient from './api';

class ProblemService {
    // Get all problems with filters
    async getProblems(filters = {}) {
        const params = new URLSearchParams();

        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.category && filters.category !== 'All Topics') {
            params.append('category', filters.category);
        }
        if (filters.tags) params.append('tags', filters.tags);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const queryString = params.toString();
        const endpoint = queryString ? `/problems?${queryString}` : '/problems';

        return await apiClient.get(endpoint, { auth: false });
    }

    // Get single problem
    async getProblem(id) {
        return await apiClient.get(`/problems/${id}`, { auth: false });
    }

    // Get problem statistics
    async getProblemStats() {
        return await apiClient.get('/problems/stats', { auth: false });
    }

    // Create problem (Teacher/Admin only)
    async createProblem(problemData) {
        return await apiClient.post('/problems', problemData);
    }

    // Update problem (Teacher/Admin only)
    async updateProblem(id, problemData) {
        return await apiClient.put(`/problems/${id}`, problemData);
    }

    // Delete problem (Teacher/Admin only)
    async deleteProblem(id) {
        console.log('ProblemService: Attempting to delete problem with ID:', id);
        try {
            const result = await apiClient.delete(`/problems/${id}`);
            console.log('ProblemService: Delete result:', result);
            return result;
        } catch (error) {
            console.error('ProblemService: Delete error:', error);
            throw error;
        }
    }
}

export const problemService = new ProblemService();
export default problemService;
