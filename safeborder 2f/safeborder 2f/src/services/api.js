// src/services/api.js
import axios from "axios";

/**
 * ============================
 * BASE API CONFIG
 * ============================
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Instance Axios PRINCIPALE
 * 👉 utilisée UNIQUEMENT pour /api/surveillance/
 */
const api = axios.create({
  baseURL: `${API_BASE}/api/surveillance/`,
  timeout: 30000,
});

/**
 * ============================
 * INTERCEPTOR JWT (AMÉLIORÉ)
 * ============================
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    // 🔥 Ne jamais injecter le token sur les routes auth
    const isAuthRoute = config.url?.includes("auth/");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ============================
 * INTERCEPTOR RESPONSE (GESTION 401)
 * ============================
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔥 Si erreur 401 et pas déjà tenté de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenter de rafraîchir le token
        const refreshToken = localStorage.getItem("refresh");
        
        if (!refreshToken) {
          // Déconnecter l'utilisateur
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${API_BASE}/api/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = refreshResponse.data.access;
        
        // Mettre à jour le token
        localStorage.setItem("access", newAccessToken);
        
        // Reconfigurer la requête originale
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Relancer la requête
        return api(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * ============================
 * DASHBOARD (FISHERMAN)
 * ============================
 */
export function fetchFishermanDashboard() {
  return api.get("fisherman-reports/dashboard/");
}

/**
 * ============================
 * REPORTS
 * ============================
 */
export function fetchMyReports() {
  return api.get("fisherman-reports/my_reports/");
}

export function fetchReportById(id) {
  return api.get(`fisherman-reports/${id}/`);
}

export function createReport(payload) {
  return api.post("fisherman-reports/", payload);
}

export function addMediaToReport(reportId, mediaFileId) {
  return api.post(`fisherman-reports/${reportId}/add_media/`, {
    media_file_id: mediaFileId,
  });
}

/**
 * ============================
 * MEDIA
 * ============================
 */
export function fetchMediaList() {
  return api.get("media/");
}

export function uploadMedia({ file, mediaType, cameraId = null }) {
  const form = new FormData();

  if (cameraId !== null) {
    form.append("camera", cameraId);
  }

  form.append("media_type", mediaType);
  form.append("file", file);

  return api.post("media/upload_media/", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export default api;