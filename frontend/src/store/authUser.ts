import { create } from "zustand";
import axios from "axios";
import { toast } from "react-hot-toast";
import type { AuthState } from "../types";

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isSigningUp: false,
  isCheckingAuth: true,
  isLoggingOut: false,
  isLogginIn: false,
  signup: async (credentials: { username: string; email: string; password: string }) => {
    set({ isSigningUp: true });
    try {
      const response = await axios.post("/api/v1/auth/signup", credentials);
      set({ user: response.data.user, isSigningUp: false });
      toast.success("Account created successfully");
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message) || "Signup Failed";
      set({ isSigningUp: false, user: null });
    }
  },
  login: async (credentials: { email: string; password: string }) => {
    set({ isLogginIn: true });
    try {
      const response = await axios.post("/api/v1/auth/login", credentials);

      set({ user: response.data.user, isLogginIn: false });
      toast.success("Logged in successfully");
    } catch (error: any) {
      set({ isLogginIn: false, user: null });
      toast.error(error.response?.data?.message || "Login Failed");
    }
  },
  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axios.post("/api/v1/auth/logout");
      set({ user: null, isLoggingOut: false });
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Logout Failed");
      set({ isLoggingOut: false });
    }
  },
  authCheck: async () => {
    set({ isCheckingAuth: true });

    try {
      const response = await axios.get("/api/v1/auth/authCheck");
      set({ user: response.data.user, isCheckingAuth: false });
    } catch (error: any) {
      set({ user: null, isCheckingAuth: false });
      // toast.error(error.response?.data?.message || "Auth Check Failed");
    }
  },
}));
