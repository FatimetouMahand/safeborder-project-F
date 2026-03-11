// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
  const { access, user, loading } = useAuth();

  // ============================
  // 🧪 DEV MODE — BYPASS TEMPORAIRE
  // ============================
  const DEV_MODE = false; // ❗ Mettre à false pour la production

  if (DEV_MODE) {
    return children;
  }

  // ⏳ Attendre la fin du chargement auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'authentification...</p>
        </div>
      </div>
    );
  }

  // 🔥 CORRECTION CRITIQUE : Attendre que user soit chargé si access existe
  if (access && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil utilisateur...</p>
        </div>
      </div>
    );
  }

  // 🔐 Pas connecté
  if (!access) {
    return <Navigate to="/login" replace />;
  }

  // 🧠 Vérification supplémentaire (sécurité)
  if (!user) {
    console.error("ProtectedRoute: access token exists but user is null");
    return <Navigate to="/login" replace />;
  }

  // 🎭 contrôle des rôles
  if (roles.length > 0) {
    const role = user.user_type;
    if (!roles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}