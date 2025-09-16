import axios from "axios";

const apiURL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.floatchat.upayan.dev";
const aiURL =
  process.env.NEXT_PUBLIC_AI_URL || "https://ai.floatchat.upayan.dev";

const api = axios.create({
  baseURL: apiURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const ai = axios.create({
  baseURL: aiURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getApiInstance(type: "api" | "ai" = "api") {
  return type === "ai" ? ai : api;
}

export { api, ai, aiURL, apiURL };
