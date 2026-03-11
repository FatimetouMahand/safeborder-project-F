import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import axios from "../../services/api";

const STATUS_UI = {
  pending: { 
    label: "Pending", 
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ring-1 ring-yellow-600/20 dark:ring-yellow-500/20" 
  },
  verified: { 
    label: "Verified", 
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-600/20 dark:ring-blue-500/20" 
  },
  resolved: { 
    label: "Resolved", 
    badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ring-1 ring-green-600/20 dark:ring-green-500/20" 
  },
  rejected: { 
    label: "Rejected", 
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-1 ring-red-600/20 dark:ring-red-500/20" 
  },
};

const ReportsManagement = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, [mounted]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching data from API...");
      const res = await axios.get("fisherman-reports/");
      console.log("API Response:", res.data);
      
      const data = res.data;
      
      if (Array.isArray(data)) {
        console.log("✅ API returns Array directly, records count:", data.length);
        setReports(data);
      } else if (data && data.results && Array.isArray(data.results)) {
        console.log("✅ API returns Pagination, records count:", data.results.length);
        setReports(data.results);
      } else if (data && typeof data === 'object') {
        console.log("⚠️ API returns Object, extracting data...");
        const dataArray = Object.values(data).filter(item => item && typeof item === 'object');
        setReports(dataArray);
      } else {
        console.log("❌ No data");
        setReports([]);
      }
      
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      
      if (err.response) {
        console.error("Error details:", err.response.data);
        console.error("Status code:", err.response.status);
        
        if (err.response.status === 401) {
          setError("Authentication error (401). Please login.");
        } else if (err.response.status === 403) {
          setError("Access denied (403). Check permissions.");
        } else if (err.response.status === 404) {
          setError("Endpoint not found (404). Check API URL.");
        } else {
          setError(`Failed to load reports (${err.response.status})`);
        }
      } else if (err.request) {
        console.error("No response from server");
        setError("Cannot connect to server. Make sure Django is running.");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    console.log("Loading reports for the first time...");
    fetchReports();
  }, [mounted]);

  useEffect(() => {
    if (location.state?.refresh) {
      console.log("Refreshing reports after update...");
      fetchReports();
    }
  }, [location.state]);

  // ✅ NAVIGATION ITEMS WITH ROUTES
  const navItems = [
  
    { id: 2, label: 'Caméras', path: '/admin/cameras', active: false },
    { id: 3, label: 'Média', path: '/admin/media', active: false },
    { id: 4, label: 'Alerts', path: '/admin/alerts', active: false },
    { id: 5, label: 'Weather', path: '/admin/weather', active: false },
    { id: 6, label: 'Reports', path: '/admin/reports', active: true },
    { id: 7, label: 'Analytics', path: '/admin/analytics', active: false },
  ];

  // ✅ Check if current path matches nav item
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    if (path === '/admin/reports') {
      // If already on reports page, refresh
      fetchReports();
    } else {
      // Navigate to other pages
      navigate(path);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D6B8A] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] dark:text-white overflow-x-hidden min-h-screen flex flex-col">
      {/* TOP NAVIGATION - DYNAMIC HEADER */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2632] px-8 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-9 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">shield_person</span>
            </div>
            <div>
              <h2 className="text-[#0d141b] dark:text-white text-xl font-bold tracking-tight">
                SafeBorder AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reports Management • {reports.length} total reports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-8 w-px bg-slate-300 dark:bg-slate-700"></div>
            <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-blue-700/10">
              Admin View
            </span>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-8">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`${
                  isActive(item.path)
                    ? 'text-primary text-sm font-bold border-b-2 border-primary pb-1' 
                    : 'text-[#0d141b] dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium'
                } whitespace-nowrap tracking-wide bg-transparent border-none cursor-pointer`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex gap-4 items-center">
          
          
          
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-[#0d141b] dark:text-white">Admin_User</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Super Admin</p>
            </div>
            <div className="size-9 rounded-full bg-slate-300 dark:bg-slate-600 overflow-hidden">
              <img 
                alt="Profile" 
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh75uF-MQvNu3NfqgmKuxAPloAir1tJcDGpK8tPU5Pfia-FIcN3kBR02aSEPVc1cVWufETRZE3Cg7a022lyPQiqxVvcVCqDHjYmaZ37B0i6-CVyU03ALJsJDkJ54Yx7InYTzVuGoB0wGL0zRCxgZ2VujBRB-6Xqfgaf8IjuA6WuoUuuQ76vNjqzSZi09voVvJpdP9fnFrwglS8NZZB5SrvBkVXiiARiQxNPdoIhnc8UPhwZ1MiztKBhvi2BTtde4Jt4Pc3x1OQMNo"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141b] dark:text-white text-3xl font-black">
                Reports Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Review, process, and map incoming fisherman observations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <span className="material-symbols-outlined">info</span>
                <span className="font-semibold">Debug Information</span>
              </div>
              <button 
                onClick={() => {
                  console.log("Current reports state:", reports);
                  console.log("Loading state:", loading);
                  console.log("Error state:", error);
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Show Console
              </button>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Reports: {reports.length} | Status: {loading ? 'Loading...' : error ? 'Error' : 'Ready'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <span className="material-symbols-outlined">error</span>
                <span className="font-semibold">Error: {error}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={fetchReports}
                  className="text-sm px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-700"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Reload Page
                </button>
              </div>
            </div>
          )}

          {/* TABLE */}
          <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-bold text-[#0d141b] dark:text-white">All Reports</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Showing {reports.length} of {reports.length} reports
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                  {reports.length} Reports
                </span>
                <button 
                  onClick={fetchReports}
                  className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-blue-600"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2">Loading reports...</p>
                </div>
              ) : error ? (
                <div className="px-6 py-10 text-center text-red-500 dark:text-red-400">
                  <span className="material-symbols-outlined text-2xl mb-2">error</span>
                  <p className="mb-4">{error}</p>
                  <button 
                    onClick={fetchReports}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    Retry
                  </button>
                </div>
              ) : reports.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-2xl mb-2">search_off</span>
                  <p className="mb-2">No reports found</p>
                  <p className="text-sm mb-4">Check API connection or if database contains reports</p>
                  <button 
                    onClick={fetchReports}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    Refresh Data
                  </button>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">ID</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fisherman</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Title</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reports.map((report) => {
                      const statusUI = STATUS_UI[report.status] || STATUS_UI.pending;
                      return (
                        <tr 
                          key={report.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-[#0d141b] dark:text-white">
                            #{report.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {report.created_at ? new Date(report.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {report.fisherman_username?.slice(0, 2).toUpperCase() || '??'}
                              </div>
                              <span className="text-sm font-medium text-[#0d141b] dark:text-white">
                                {report.fisherman_username || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">
                            {report.title || '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusUI.badge}`}>
                              {statusUI.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/reports/${report.id}`);
                              }}
                              className="text-primary font-semibold text-sm hover:underline px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-[#1a2632] border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
                <span className="material-symbols-outlined text-base">public</span>
                <span>Active Monitoring Zone: Sector A-12</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                System Status: Operational • Latency: 24ms • Encryption: AES-256
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ©️ 2023 SafeBorder AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReportsManagement;