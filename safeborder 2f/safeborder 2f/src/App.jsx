// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
// À ajouter dans les imports
// À ajouter dans les imports
import ReportDetailsAdmin from "./features/admin/ReportDetailsAdmin";

// À ajouter dans les routes <Route>


/* ================= PUBLIC ================= */
import Landing from "./pages/Landing";
import Login from "./features/auth/Login";

/* ================= ADMIN ================= */
import AdminDashboard from "./features/admin/AdminDashboard";
import CamerasPage from "./features/admin/CameraManagement";
import MediaPage from "./features/admin/MediaManagement";
import AlertsPage from "./features/admin/AlertsManagement";
import WeatherDashboard from "./features/admin/WeatherDashboard";
import ReportsManagement from "./features/admin/ReportsManagement";
import AnalyticsDashboard from "./features/admin/AnalyticsDashboard";

/* ================= FISHERMAN ================= */
import FishermanLayout from "./features/fisherman/Layout.jsx";
import FishermanDashboard from "./features/fisherman/FishermanDashboard.jsx";
import MyReports from "./features/fisherman/MyReports.jsx";
import NewReport from "./features/fisherman/NewReport.jsx";
import ReportDetails from "./features/fisherman/ReportDetails.jsx";
import MediaGallery from "./features/fisherman/MediaGallery.jsx";

/* ================= SIMULATOR ================= */
import Simulator from "./features/simulator/simulator";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cameras"
          element={
            <ProtectedRoute roles={["admin"]}>
              <CamerasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/media"
          element={
            <ProtectedRoute roles={["admin"]}>
              <MediaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/alerts"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AlertsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/weather"
          element={
            <ProtectedRoute roles={["admin"]}>
              <WeatherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ReportsManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
<Route
  path="/admin/reports/:id"
  element={
    <ProtectedRoute roles={["admin"]}>
      <ReportDetailsAdmin />
    </ProtectedRoute>
  }
/>
        {/* ================= SIMULATOR ================= */}
        <Route
          path="/simulator"
          element={
            <ProtectedRoute roles={["simulation"]}>
              <Simulator />
            </ProtectedRoute>
          }
        />

        {/* ================= FISHERMAN ================= */}
        <Route
          path="/fisherman"
          element={
            <ProtectedRoute roles={["fisherman"]}>
              <FishermanLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<FishermanDashboard />} />
          <Route path="reports" element={<MyReports />} />
          <Route path="reports/new" element={<NewReport />} />
          <Route path="reports/:id" element={<ReportDetails />} />
          <Route path="media" element={<MediaGallery />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
