import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        console.log('[AUTH] 🔍 Checking authentication status...');

        try {
            const res = await axiosInstance.get("/auth/check");

            console.log('[AUTH] ✅ Authentication check successful');
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.error('[AUTH] ❌ Authentication check failed:', error.response?.data?.message || error.message);

            if (error.response?.status === 401) {
                console.log('[AUTH] User not authenticated - redirecting to login');
            } else {
                console.error('[AUTH] Unexpected error during auth check:', error);
            }

            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        console.log('[AUTH] 📝 Starting signup process...');
        set({ isSigningUp: true });

        try {
            const res = await axiosInstance.post("/auth/signup", data);

            console.log('[AUTH] ✅ Signup successful');
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Signup failed';
            const errorCode = error.response?.data?.error;

            console.error('[AUTH] ❌ Signup failed:', errorMessage, errorCode ? `(${errorCode})` : '');

            // Show user-friendly error messages
            if (errorCode === 'EMAIL_EXISTS') {
                toast.error("An account with this email already exists");
            } else if (errorCode === 'PASSWORD_TOO_SHORT') {
                toast.error("Password must be at least 6 characters long");
            } else if (errorCode === 'MISSING_FIELDS') {
                toast.error("Please fill in all required fields");
            } else {
                toast.error(errorMessage);
            }
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        console.log('[AUTH] 🔐 Starting login process...');
        set({ isLoggingIn: true });

        try {
            const res = await axiosInstance.post("/auth/login", data);

            console.log('[AUTH] ✅ Login successful');
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            get().connectSocket();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            const errorCode = error.response?.data?.error;

            console.error('[AUTH] ❌ Login failed:', errorMessage, errorCode ? `(${errorCode})` : '');

            // Show user-friendly error messages
            if (errorCode === 'INVALID_CREDENTIALS') {
                toast.error("Invalid email or password");
            } else if (errorCode === 'MISSING_FIELDS') {
                toast.error("Please enter both email and password");
            } else {
                toast.error(errorMessage);
            }
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        console.log('[AUTH] 🚪 Starting logout process...');

        try {
            await axiosInstance.post("/auth/logout");

            console.log('[AUTH] ✅ Logout successful');
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Logout failed';

            console.error('[AUTH] ❌ Logout failed:', errorMessage);
            toast.error(errorMessage);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const formData = new FormData();

            // If data contains a file, append it as a file
            if (data.profilePic instanceof File) {
                formData.append('profilePic', data.profilePic);
            }

            const res = await axiosInstance.put("/auth/update-profile", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();

        if (!authUser) {
            console.log('[SOCKET] ⚠️ Cannot connect socket - no authenticated user');
            return;
        }

        if (get().socket?.connected) {
            console.log('[SOCKET] ⚠️ Socket already connected');
            return;
        }

        console.log(`[SOCKET] 🔌 Connecting socket for user: ${authUser._id}`);

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });

        socket.connect();
        set({ socket: socket });

        socket.on('connect', () => {
            console.log('[SOCKET] ✅ Socket connected successfully');
        });

        socket.on('disconnect', () => {
            console.log('[SOCKET] 🔌 Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('[SOCKET] ❌ Socket connection error:', error.message);
        });

        socket.on("getOnlineUsers", (userIds) => {
            console.log(`[SOCKET] 👥 Received online users: [${userIds.join(', ')}]`);
            set({ onlineUsers: userIds });
        });
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}));