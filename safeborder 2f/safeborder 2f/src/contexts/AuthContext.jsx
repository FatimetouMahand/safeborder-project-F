// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [access, setAccess] = useState(() => localStorage.getItem("access"));
  const [refresh, setRefresh] = useState(() => localStorage.getItem("refresh"));
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true); // Commence à true pour le premier chargement
  const [initialLoad, setInitialLoad] = useState(true);

  // 🔥 Fonction pour charger le profil utilisateur
  const loadUserProfile = useCallback(async () => {
    if (!access) {
      setUser(null);
      localStorage.removeItem("user");
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    // Si user existe déjà et est valide, on skip
    if (user && user.id && user.username) {
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    setLoading(true);
    try {
      const profile = await fetchCurrentUser(access);
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    } catch (err) {
      console.error("fetchCurrentUser failed:", err);
      // Si erreur 401, on déconnecte
      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        setAccess(null);
        setRefresh(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [access, user]);

  // Charger le profil au démarrage et quand access change
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // 🔥 Login amélioré avec gestion d'état synchrone
  async function login(username, password) {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      const accessToken = data.access;
      const refreshToken = data.refresh;
      const profile = data.user || null;

      if (!accessToken) {
        throw new Error("No access token returned from server");
      }

      // Sauvegarde synchrone
      localStorage.setItem("access", accessToken);
      localStorage.setItem("refresh", refreshToken || "");
      if (profile) {
        localStorage.setItem("user", JSON.stringify(profile));
      }

      // Mise à jour IMMÉDIATE de l'état
      setAccess(accessToken);
      setRefresh(refreshToken);
      setUser(profile || null);
      setLoading(false);

      return { 
        success: true, 
        user: profile || null,
        role: profile?.user_type 
      };
    } catch (err) {
      console.error("login error", err);
      setLoading(false);
      return { 
        success: false, 
        error: err.response?.data || err.message 
      };
    }
  }

  // 🔥 Logout
  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setAccess(null);
    setRefresh(null);
    setUser(null);
    setLoading(false);
  }

  // 🔥 Rafraîchir le token
  async function refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        logout();
        return null;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const newAccessToken = data.access;

      localStorage.setItem("access", newAccessToken);
      setAccess(newAccessToken);

      return newAccessToken;
    } catch (err) {
      console.error("refresh token error", err);
      logout();
      return null;
    }
  }

  const value = {
    access,
    refresh,
    user,
    loading: loading || initialLoad, // 🔥 Combine les deux états de chargement
    login,
    logout,
    refreshAccessToken,
    loadUserProfile, // 🔥 Exposé pour pouvoir recharger manuellement
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}