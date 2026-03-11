// src/features/fisherman/Layout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function FishermanLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.user_type || "";

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="font-[Poppins] bg-[#F1F5F9] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F1F5F9]/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-[#1E3A8A] font-extrabold">SafeBorder AI</div>
              {user && (
                <div className="ml-3 text-sm text-slate-600">
                  {user.first_name || user.username || user.email}
                </div>
              )}
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {role === "fisherman" && (
                <>
                  <NavLink
                    to="dashboard"
                    className={({ isActive }) =>
                      `text-sm font-semibold ${
                        isActive
                          ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A] pb-1"
                          : "text-slate-600 hover:text-[#1E3A8A]"
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="reports"
                    className={({ isActive }) =>
                      `text-sm font-semibold ${
                        isActive
                          ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A] pb-1"
                          : "text-slate-600 hover:text-[#1E3A8A]"
                      }`
                    }
                  >
                    My Reports
                  </NavLink>

                  <NavLink
                    to="reports/new"
                    className={({ isActive }) =>
                      `text-sm font-semibold ${
                        isActive
                          ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A] pb-1"
                          : "text-slate-600 hover:text-[#1E3A8A]"
                      }`
                    }
                  >
                    New Report
                  </NavLink>

                  <NavLink
                    to="media"
                    className={({ isActive }) =>
                      `text-sm font-semibold ${
                        isActive
                          ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A] pb-1"
                          : "text-slate-600 hover:text-[#1E3A8A]"
                      }`
                    }
                  >
                    Media
                  </NavLink>
                </>
              )}

              {role === "simulation" && (
                <>
                  <NavLink
                    to="/simulator"
                    className={({ isActive }) =>
                      `text-sm font-semibold ${
                        isActive
                          ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A] pb-1"
                          : "text-slate-600 hover:text-[#1E3A8A]"
                      }`
                    }
                  >
                    Simulator
                  </NavLink>
                </>
              )}

              {role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `text-sm font-semibold ${
                      isActive
                        ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A] pb-1"
                        : "text-slate-600 hover:text-[#1E3A8A]"
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:underline"
                >
                  Logout
                </button>
              )}
            </nav>

            {/* Mobile navigation */}
            <div className="md:hidden">
              {user ? (
                <div className="flex items-center gap-3">
                  {role === "fisherman" && (
                    <>
                      <NavLink to="dashboard" className="text-sm text-slate-600">
                        Dash
                      </NavLink>
                      <NavLink to="reports" className="text-sm text-slate-600">
                        Reports
                      </NavLink>
                    </>
                  )}
                  {role === "simulation" && (
                    <NavLink to="/simulator" className="text-sm text-slate-600">
                      Simulator
                    </NavLink>
                  )}
                  {role === "admin" && (
                    <NavLink to="/admin" className="text-sm text-slate-600">
                      Admin
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink to="/login" className="text-sm text-slate-600">
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
