import apiClient from './api';

class ContestService {
    // Get all contests
    async getContests(filters = {}) {
        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const queryString = params.toString();
        const endpoint = queryString ? `/contests?${queryString}` : '/contests';

        // Send auth token if available (teachers will see all contests)
        return await apiClient.get(endpoint, { auth: true });
    }

    // Get single contest
    async getContest(id) {
        return await apiClient.get(`/contests/${id}`, { auth: true });
    }

    // Create contest (Teacher/Admin only)
    async createContest(contestData) {
        return await apiClient.post('/contests', contestData);
    }

    // Update contest (Teacher/Admin only)
    async updateContest(id, contestData) {
        return await apiClient.put(`/contests/${id}`, contestData);
    }

    // Delete contest (Teacher/Admin only)
    async deleteContest(id) {
        return await apiClient.delete(`/contests/${id}`);
    }

    // Register for contest
    async registerForContest(id) {
        return await apiClient.post(`/contests/${id}/register`);
    }

    // Get contest leaderboard
    async getLeaderboard(id) {
        return await apiClient.get(`/contests/${id}/leaderboard`, { auth: false });
    }

    // Download contest report (Teacher/Admin only)
    async downloadContestReport(id) {
        try {
            const response = await fetch(`${apiClient.baseURL}/contests/${id}/report`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download report');
            }

            // Get filename from response headers
            const contentDisposition = response.headers.get('content-disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : 'contest_report.csv';

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Get student submissions for a contest (Teacher/Admin only)
    async getStudentContestSubmissions(contestId, studentId) {
        return await apiClient.get(`/contests/${contestId}/student/${studentId}/submissions`);
    }

    // Send contest notifications manually (Teacher/Admin only)
    async sendContestNotifications(contestId) {
        return await apiClient.post(`/contests/${contestId}/notify`);
    }

    // Test email configuration (Teacher/Admin only)
    async testEmailConfig() {
        return await apiClient.get('/contests/test-email');
    }
}

export const contestService = new ContestService();
export default contestService;
