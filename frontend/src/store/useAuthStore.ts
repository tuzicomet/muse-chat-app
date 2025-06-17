import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

// Type definition for authenticated user object
type AuthUser = {
    id: string;
    name: string;
    email: string;
};
  
// Type definition for authentication-related zustand store
type AuthStore = {
    // The currently authenticated user (or null if no one is logged in)
    authUser: AuthUser | null;

    // Flags to indicate if certain actions are in progress
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;

    // Flag to indicate whether we're still checking if the user is already authenticated
    isCheckingAuth: boolean;

    // Function to check whether the user is currently authenticated (logged in)
    checkAuth: () => Promise<void>;
};

// Zustand store for managing authentication-related state across the app
// Zustand creates the store once then reuses it globally, including between page changes
// Components can access or update auth state using the useAuthStore() hook
// On initial load or refresh, checkAuth() should be called to verify if user is logged in
export const useAuthStore = create<AuthStore>((set) => ({
    // Default to null until we verify that a user is logged in (via checkAuth)
    authUser: null,

    // Default all action flags to false
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    // Assume we're still checking auth on initial load
    isCheckingAuth: true,

    // Called on app start or refresh to determine if a user session exists
    checkAuth: async () => {
        try {
            // Send GET request to backend endpoint to check auth status
            const res = await axiosInstance.get("/auth/check");
            // If successful, update authUser with the returned user data
            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in checkAuth:", error);
            // If there's an error (e.g. not logged in), clear the authUser
            set({ authUser: null });
        } finally {
            // Mark the auth check as completed, regardless of success/failure
            set({ isCheckingAuth: false });
        }
    },
}));