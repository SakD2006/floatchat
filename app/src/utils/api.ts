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

export function getApiInstance(type: "api" | "ai" = "api") {
  return type === "ai" ? ai : api;
}

export { api, ai, aiURL, apiURL };
