import axios from 'axios';

// Backend API URL - adjust for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Upload a video file for pose estimation and analytics
 * @param {File} file - Video file to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} - API response with pose data and analytics
 */
export const uploadVideo = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                if (onProgress) {
                    onProgress(percentCompleted);
                }
            },
        });

        return response.data;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

/**
 * Check API health
 * @returns {Promise} - Health status
 */
export const checkHealth = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error('Health check error:', error);
        throw error;
    }
};

/**
 * Cleanup job files
 * @param {string} jobId - Job ID to cleanup
 * @returns {Promise}
 */
export const cleanupJob = async (jobId) => {
    try {
        const response = await api.delete(`/api/cleanup/${jobId}`);
        return response.data;
    } catch (error) {
        console.error('Cleanup error:', error);
        throw error;
    }
};

export default api;
