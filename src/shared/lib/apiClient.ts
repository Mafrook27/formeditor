import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://lm-crm.designvault.info",
  headers: {
    "Content-Type": "application/json",
  },
}); // this not working backend for refrence we using us obeserve code

export const getIpAddress = async () => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch (err) {
    console.warn("Failed to get IP address", err);
    return "";
  }
};

const HARDCODED_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFkbWluIiwibmJmIjoxNzY3NTk1NjUwLCJleHAiOjE3Njc4NTQ4NTAsImlhdCI6MTc2NzU5NTY1MH0.AvoJoZ1TklL8bWSlbiF6ChIrA3WeQer54HtsmziDGho";

const api = axios.create({
  baseURL: "", // leave empty so Vite proxy is used
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${HARDCODED_TOKEN}`;
  return config;
});

export default api;
