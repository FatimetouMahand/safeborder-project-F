// src/services/authService.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const AUTH_BASE = `${API_BASE}/api/auth/`;

const authApi = axios.create({
  baseURL: AUTH_BASE,
});

/**
 * ============================
 * INTERCEPTOR POUR AUTH API
 * ============================
 */
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  
  // 🔥 Ne pas ajouter le token pour login/register
  const isLoginOrRegister = 
    config.url?.includes("login/") || 
    config.url?.includes("register/") ||
    config.url?.includes("token/refresh/");

  if (token && !isLoginOrRegister) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

/* =======================
   LOGIN
======================= */
export async function loginRequest(username, password) {
  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const res = await authApi.post("login/", formData);

    if (!res.data?.access) {
      throw new Error("No access token in response");
    }

    return res.data;
  } catch (error) {
    console.error("Login request failed:", error);
    throw error;
  }
}

/* =======================
   REGISTER
======================= */
export async function registerRequest(payload) {
  try {
    const res = await authApi.post("register/", payload);
    return res.data;
  } catch (error) {
    console.error("Register request failed:", error);
    throw error;
  }
}

/* =======================
   CURRENT USER
======================= */
export async function fetchCurrentUser(accessToken) {
  try {
    if (!accessToken) {
      throw new Error("Missing access token");
    }

    const res = await axios.get(`${AUTH_BASE}users/me/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000,
    });

    return res.data;
  } catch (error) {
    console.error("Fetch current user failed:", error);
    
    // 🔥 Si 401, propager l'erreur pour que AuthContext gère la déconnexion
    if (error.response?.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    
    throw error;
  }
}

/* =======================
   REFRESH TOKEN
======================= */
export async function refreshTokenRequest(refreshToken) {
  try {
    const res = await authApi.post("token/refresh/", {
      refresh: refreshToken,
    });
    
    if (!res.data?.access) {
      throw new Error("No access token in refresh response");
    }
    
    return res.data;
  } catch (error) {
    console.error("Refresh token failed:", error);
    throw error;
  }
}

/* =======================
   LOGOUT (optionnel - pour notifier le backend)
======================= */
export async function logoutRequest() {
  try {
    const refreshToken = localStorage.getItem("refresh");
    
    if (refreshToken) {
      await authApi.post("logout/", {
        refresh: refreshToken,
      });
    }
  } catch (error) {
    console.error("Logout request failed:", error);
    // On continue même si l'appel échoue
  }
}

export default authApi;