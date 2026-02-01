import apiClient from './api';

class ClassService {
    // Get all classes for teacher
    async getClasses() {
        return await apiClient.get('/classes');
    }

    // Get single class
    async getClass(id) {
        return await apiClient.get(`/classes/${id}`);
    }

    // Create class
    async createClass(classData) {
        return await apiClient.post('/classes', classData);
    }

    // Update class
    async updateClass(id, classData) {
        return await apiClient.put(`/classes/${id}`, classData);
    }

    // Delete class
    async deleteClass(id) {
        return await apiClient.delete(`/classes/${id}`);
    }

    // Add student to class
    async addStudent(classId, studentData) {
        return await apiClient.post(`/classes/${classId}/students`, studentData);
    }

    // Add multiple students by email
    async addBulkStudents(classId, emails) {
        return await apiClient.post(`/classes/${classId}/students/bulk`, { emails });
    }

    // Remove student from class
    async removeStudent(classId, studentId) {
        return await apiClient.delete(`/classes/${classId}/students/${studentId}`);
    }

    // Get class students
    async getClassStudents(classId) {
        return await apiClient.get(`/classes/${classId}/students`);
    }

    // Mark attendance
    async markAttendance(classId, attendanceData) {
        return await apiClient.post(`/classes/${classId}/attendance`, attendanceData);
    }

    // Get attendance records
    async getAttendance(classId, filters = {}) {
        const params = new URLSearchParams();
        if (filters.date) params.append('date', filters.date);
        if (filters.studentId) params.append('studentId', filters.studentId);

        const queryString = params.toString();
        const endpoint = queryString
            ? `/classes/${classId}/attendance?${queryString}`
            : `/classes/${classId}/attendance`;

        return await apiClient.get(endpoint);
    }
}

export const classService = new ClassService();
export default classService;
