import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: false,
  timeout: 15000,
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("HTTP Error:", err?.response || err?.message);
    return Promise.reject(err);
  }
);

export default http;
