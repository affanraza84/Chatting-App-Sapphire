import axios from "axios";
import toast from "react-hot-toast";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
    withCredentials: true,
});

// Request interceptor for logging
axiosInstance.interceptors.request.use(
    (config) => {
        console.log(`[API] 📤 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API] ❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for logging and global error handling
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`[API] ✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        const { response, request, message } = error;

        if (response) {
            // Server responded with error status
            console.error(`[API] ❌ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}:`, response.data);
        } else if (request) {
            // Request was made but no response received
            console.error('[API] ❌ Network error - no response received:', message);
            toast.error('Network error - please check your connection');
        } else {
            // Something else happened
            console.error('[API] ❌ Request setup error:', message);
            toast.error('Request failed - please try again');
        }

        return Promise.reject(error);
    }
);