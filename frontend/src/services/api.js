import axios from "axios";

// ================= BASE CONFIG =================
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 🔥 prevent hanging requests
});


// ================= REQUEST INTERCEPTOR =================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ================= RESPONSE INTERCEPTOR =================
API.interceptors.response.use(
  (response) => response,
  (error) => {

    const status = error.response?.status;

    // 🔐 Auto logout on unauthorized
    if (status === 401 && localStorage.getItem("token")) {
      console.warn("Session expired. Logging out...");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/auth";
    }

    // ⚠️ Too many requests (OTP spam protection)
    if (status === 429) {
      alert("Too many requests. Please wait and try again.");
    }

    // 🔥 Network error
    if (!error.response) {
      alert("Server not responding. Check backend.");
    }

    return Promise.reject(error);
  }
);


// ======================================================
// 🔐 AUTH APIs (🔥 NEW - OTP + LOGIN)
// ======================================================

// REGISTER
export const registerUser = (data) => {
  return API.post("/accounts/register/", data);
};

// LOGIN (PASSWORD)
export const loginUser = (data) => {
  return API.post("/accounts/login/", data);
};

// SEND OTP
export const sendOtp = (email) => {
  return API.post("/accounts/send-otp/", { email });
};

// VERIFY OTP
export const verifyOtp = (data) => {
  return API.post("/accounts/verify-otp/", data);
};

// PROFILE
export const getProfile = () => {
  return API.get("/accounts/profile/");
};


// ======================================================
// 📄 CONTRACT APIs
// ======================================================

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


// ================= EXPORT =================
export default API;