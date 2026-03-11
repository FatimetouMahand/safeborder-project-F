import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from "../../services/api";


const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  under_review: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  false_alarm: "bg-slate-100 text-slate-600",
  ignored: "bg-yellow-100 text-yellow-700",
};



const AlertsManagement = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(1);

  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Search state local seulement
  const [searchTerm, setSearchTerm] = useState('');

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
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, []);

  const handleNotificationsClick = () => {
    setNotificationsCount(0);
    // TODO: Implémenter l'API de notifications
    console.log('Notifications cleared');
  };

  const handleRefreshData = () => {
    fetchAlerts();
  };

  const handleLogout = () => {
     navigate("/login");
  };

  // Navigation avec React Router
  const navItems = [
    
    { id: 2, label: 'Caméras', path: '/admin/cameras' },
    { id: 3, label: 'Média', path: '/admin/media' },
    { id: 4, label: 'Alerts', path: '/admin/alerts' },
    { id: 5, label: 'Weather', path: '/admin/weather' },
    { id: 6, label: 'Reports', path: '/admin/reports' },
    { id: 7, label: 'Analytics', path: '/admin/analytics' },
  ];

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("alerts/?ordering=-created_at");

      const data = Array.isArray(res.data.results)
        ? res.data.results
        : (Array.isArray(res.data) ? res.data : []);

      // Mapping sans valeurs fake - seulement "—" si null/undefined
      const mappedData = data.map((item) => {
        return {
          id: item.id,
          time: formatDate(item.created_at),

          sourceType: item.source_type ?? "—",   // camera / fisherman / admin
          sourceId: item.source_id ?? "—",

          status: item.status ?? "—",

          // objet IA complet
          aiAnalysis: item.ai_analysis ?? null,

          raw: item
        };
      });
      
      setAlertsData(mappedData);
    } catch (err) {
      console.error("Erreur lors du chargement des alertes:", err);
      setError("Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Filtrer les alertes localement par ID
  const filteredAlerts = alertsData.filter(alert => {
    if (!searchTerm) return true;
    
    // Recherche par ID
    const idStr = alert.id.toString();
    return idStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
  <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] dark:text-white overflow-x-hidden min-h-screen flex flex-col">
    {/* TOP NAVIGATION avec React Router */}
    <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2632] px-8 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="size-9 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">shield_person</span>
          </div>
          <h2 className="text-[#0d141b] dark:text-white text-xl font-bold tracking-tight">
            SafeBorder AI
          </h2>
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
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'text-primary text-sm font-bold border-b-2 border-primary pb-1 whitespace-nowrap tracking-wide'
                  : 'text-[#0d141b] dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium whitespace-nowrap tracking-wide'
              }
              end={item.path === '/admin/dashboard'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex gap-4 items-center">
        

       

        <button className="flex items-center gap-3 rounded-xl pl-2 pr-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
          <div className="size-9 rounded-full bg-slate-300 dark:bg-slate-600 overflow-hidden">
            <img
              alt="Profile"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh75uF-MQvNu3NfqgmKuxAPloAir1tJcDGpK8tPU5Pfia-FIcN3kBR02aSEPVc1cVWufETRZE3Cg7a022lyPQiqxVvcVCqDHjYmaZ37B0i6-CVyU03ALJsJDkJ54Yx7InYTzVuGoB0wGL0zRCxgZ2VujBRB-6Xqfgaf8IjuA6WuoUuuQ76vNjqzSZi09voVvJpdP9fnFrwglS8NZZB5SrvBkVXiiARiQxNPdoIhnc8UPhwZ1MiztKBhvi2BTtde4Jt4Pc3x1OQMNo"
            />
          </div>
          <span className="font-medium dark:text-white hidden md:block">Admin User</span>
        </button>
        
        
      </div>
    </header>
    
      <main className="flex-1 py-8 px-6">

    
    {/* Page Header */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <NavLink to="/admin/dashboard" className="hover:text-primary transition-colors">
            Home
          </NavLink>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-medium">Alerts Management</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#0d141b] dark:text-white">
          Alerts Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Monitor and resolve security incidents across all sectors in real-time.
        </p>
      </div>
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-800">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-xs font-bold uppercase tracking-wide">System Live</span>
      </div>
    </div>

    {/* Toolbar SIMPLIFIÉE - pas de filters fake */}
    <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="relative w-full lg:w-80 group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </span>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white placeholder:text-slate-500/70" 
            placeholder="Search by Alert ID..." 
            type="text"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button 
            onClick={handleRefreshData}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-600 rounded-lg text-sm font-bold text-white shadow-sm shadow-primary/30 transition-all"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* SUPPRIMÉ: Section Filters complètement */}
    </div>

    {/* Data Table */}
    <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
  <thead>
    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">ID & Time</th>
      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Source</th>
      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">AI Analysis</th>
      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
    </tr>
  </thead>

  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
    {filteredAlerts.map(alert => (
      <tr key={alert.id} className="group hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
        
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="font-bold group-hover:text-primary">#{alert.id}</span>
            <span className="text-xs text-slate-500">{alert.time}</span>
          </div>
        </td>

        <td className="px-6 py-4 text-sm">
          {alert.sourceType} — ID {alert.sourceId}
        </td>

        <td className="px-6 py-4">
          <button
            onClick={() => setSelectedAlert(alert)}
            className="text-primary font-medium hover:underline"
          >
            View details
          </button>
        </td>

        <td className="px-6 py-4">
          {alert.status !== "—" ? (
            <span
  className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${
    STATUS_STYLES[alert.status] || "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
  }`}
>
  {alert.status}
</span>
          ) : (
            <span className="text-slate-400 text-xs">—</span>
          )}
        </td>

        <td className="px-6 py-4 text-right text-slate-400">
              <button
              onClick={() => setSelectedAlert(alert)}
              className="text-primary text-sm hover:underline"
              >
                Review
              </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>    
      
            {/* Footer avec statistiques */}
            {!loading && !error && filteredAlerts.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">info</span>
                      Showing {filteredAlerts.length} of {alertsData.length} alerts
                      {searchTerm && (
                        <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded text-xs">
                          filtered
                        </span>
                      )}
                    </span>
                    
                  </div>
                  <div className="text-xs">
                    Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

         {selectedAlert && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-[#1a2632] rounded-xl p-6 w-full max-w-xl shadow-lg">

      <h2 className="text-xl font-bold mb-4">AI Analysis Details</h2>

      <div className="space-y-3 text-sm">
        <p><strong>Detected Object:</strong> {selectedAlert.aiAnalysis?.object ?? "—"}</p>
        <p><strong>Risk Level:</strong> {selectedAlert.aiAnalysis?.risk_level ?? "—"}</p>
        <p><strong>Confidence:</strong> {selectedAlert.aiAnalysis?.confidence ?? "—"}%</p>

        <div>
          <strong>AI Explanation:</strong>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            {selectedAlert.aiAnalysis?.message ?? "—"}
          </p>
        </div>

        <div>
          <strong>AI Decision / Comment:</strong>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            {selectedAlert.aiAnalysis?.decision ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={() => setSelectedAlert(null)}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
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
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                Support
              </a>
              <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                Contact
              </a>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} SafeBorder AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlertsManagement;