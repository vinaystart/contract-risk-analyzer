import axios from "axios";

// ✅ Create Axios instance
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // 🔥 Only attach if exists (safe)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle unauthorized globally (SAFE)
API.interceptors.response.use(
  (response) => response,
  (error) => {

    // 🔥 Only logout if token exists (avoid breaking public APIs)
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      console.warn("Session expired. Logging out...");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/auth";
    }

    return Promise.reject(error);
  }
);


// ---------------- API FUNCTIONS ----------------

// 🔹 UPLOAD
export const uploadContract = (formData, onUploadProgress) => {
  return API.post("/contracts/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
};

// 🔹 ANALYZE
export const analyzeContract = (id) => {
  return API.get(`/contracts/analysis/${id}/`);
};

// 🔹 SUMMARY
export const getRiskSummary = () => {
  return API.get("/contracts/analysis/summary/");
};

// 🔹 ANALYTICS
export const getAnalytics = () => {
  return API.get("/contracts/analytics/");
};

// 🔹 SEARCH
export const searchContracts = (query) => {
  return API.get(`/contracts/search/?q=${query}`);
};

export default API;