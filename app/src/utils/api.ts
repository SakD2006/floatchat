import axios from "axios";

const apiURL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.floatchat.upayan.dev";
const aiURL =
  process.env.NEXT_PUBLIC_AI_URL || "https://ai.floatchat.upayan.dev";

// Configure axios defaults for cross-origin cookies
axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: apiURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const ai = axios.create({
  baseURL: aiURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stale authentication state on 401
      if (typeof window !== "undefined") {
        console.log("[API] 401 received, clearing auth state");
      }
    }
    return Promise.reject(error);
  }
);

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("[API Request]", config.method?.toUpperCase(), config.url);
    if (typeof document !== "undefined") {
      console.log("[API Request] Cookies:", document.cookie);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Chat API functions
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  data?: Record<string, unknown>[];
  isLoading?: boolean;
}

export interface ChatRequest {
  message: string;
  session_id: string;
}

export interface ChatResponse {
  summary: string;
  data?: Record<string, unknown>[];
}

export interface AuthUser {
  email: string;
  name?: string;
  id: string;
}

// Authentication API functions
export const authAPI = {
  // Get current user profile
  getProfile: async (): Promise<AuthUser | null> => {
    try {
      const response = await api.get("/api/auth/profile");
      return response.data;
    } catch (error) {
      console.error("[Auth] Failed to get profile:", error);
      return null;
    }
  },

  // Login with email/password
  login: async (email: string, password: string): Promise<AuthUser | null> => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      return response.data.user;
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      throw error;
    }
  },

  // Register new user
  register: async (
    email: string,
    password: string,
    name?: string
  ): Promise<AuthUser | null> => {
    try {
      const response = await api.post("/api/auth/register", {
        email,
        password,
        name,
      });
      return response.data.user;
    } catch (error) {
      console.error("[Auth] Registration failed:", error);
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("[Auth] Logout failed:", error);
      throw error;
    }
  },

  // Google OAuth URL
  getGoogleAuthUrl: (): string => {
    return `${apiURL}/api/auth/google`;
  },
};

// Chat API functions
export const chatAPI = {
  // Send message to AI and get response
  sendMessage: async (
    message: string,
    sessionId: string
  ): Promise<ChatResponse> => {
    try {
      const response = await ai.post("/api/v1/chat", {
        message,
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("[Chat] Failed to send message:", error);
      throw error;
    }
  },

  // Health check for AI service
  checkHealth: async (): Promise<boolean> => {
    try {
      await ai.get("/api/v1/health");
      return true;
    } catch (error) {
      console.error("[Chat] AI service health check failed:", error);
      return false;
    }
  },
};

// Utility functions
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export function getApiInstance(type: "api" | "ai" = "api") {
  return type === "ai" ? ai : api;
}

export { api, ai, aiURL, apiURL };
