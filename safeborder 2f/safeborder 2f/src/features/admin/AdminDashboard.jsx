import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from "../../services/api";

const AdminDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(1);
  const navigate = useNavigate();

  // États de chargement et d'erreur
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [error, setError] = useState(null);

  // États dynamiques
  const [statsData, setStatsData] = useState([
    {
      id: 1,
      icon: 'videocam',
      label: 'Total Cameras',
      value: '—',
      trend: '+5% vs yesterday',
      trendColor: 'emerald',
      trendIcon: 'trending_up'
    },
    {
      id: 2,
      icon: 'cloud_upload',
      label: 'Media Processed',
      value: '—',
      trend: '+12% vs yesterday',
      trendColor: 'emerald',
      trendIcon: 'trending_up'
    },
    {
      id: 3,
      icon: 'warning',
      label: 'New Alerts',
      value: '—',
      trend: '+2% vs yesterday',
      trendColor: 'emerald',
      trendIcon: 'trending_up'
    },
    {
      id: 4,
      icon: 'pending_actions',
      label: 'Pending Reports',
      value: '—',
      trend: '+10% vs yesterday',
      trendColor: 'emerald',
      trendIcon: 'trending_up'
    },
    {
      id: 5,
      icon: 'wb_sunny',
      label: 'Weather Risk',
      value: '—',
      badge: 'Clear Skies',
      badgeColor: 'green'
    }
  ]);

  // ✅ CORRECTION: Stocker les données brutes de l'API
  const [mediaData, setMediaData] = useState([]);
  const [alertsData, setAlertsData] = useState([]);

  // Navigation items avec React Router
  const navItems = [
    { id: 1, label: 'Dashboard', path: '/admin/dashboard' },
    { id: 2, label: 'Caméras', path: '/admin/cameras' },
    { id: 3, label: 'Média', path: '/admin/media' },
    { id: 4, label: 'Alerts', path: '/admin/alerts' },
    { id: 5, label: 'Weather', path: '/admin/weather' },
    { id: 6, label: 'Reports', path: '/admin/reports' },
    { id: 7, label: 'Analytics', path: '/admin/analytics' },
  ];

  // Quick actions
  const quickActions = [
    { id: 1, icon: 'upload_file', label: 'Upload Media' },
    { id: 2, icon: 'add_a_photo', label: 'Create Camera' },
    { id: 3, icon: 'summarize', label: 'Generate Report' },
    { id: 4, icon: 'thunderstorm', label: 'Weather Analysis' }
  ];

  // ✅ Fonction pour formater le temps relatif (seule transformation autorisée)
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "—";

    const now = new Date();
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return "—";

    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffH / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH < 24) return `Il y a ${diffH} h`;
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString();
  };

  // ==================== FONCTIONS D'API CORRIGÉES ====================
  
  const fetchAdminStats = async () => {
    try {
      setLoadingStats(true);
      const [camerasRes, mediaRes, alertsRes, reportsRes, weatherRes] = await Promise.all([
        axios.get("cameras/"),
        axios.get("media/"),
        axios.get("alerts/?status=new"),
        axios.get("fisherman-reports/?status=pending"),
        axios.get("weather-analysis/predict_risk/"),
      ]);

      // ✅ Récupérer les données réelles sans transformation excessive
      const camerasData = Array.isArray(camerasRes.data.results) ? camerasRes.data.results : camerasRes.data;
      const mediaData = Array.isArray(mediaRes.data.results) ? mediaRes.data.results : mediaRes.data;
      const alertsData = Array.isArray(alertsRes.data.results) ? alertsRes.data.results : alertsRes.data;
      const reportsData = Array.isArray(reportsRes.data.results) ? reportsRes.data.results : reportsRes.data;
      const weatherData = weatherRes.data;

      // Calculer la taille totale des médias (seule transformation nécessaire)
      const totalMediaSize = Array.isArray(mediaData) 
        ? mediaData.reduce((sum, item) => sum + (item.file_size || 0), 0) / (1024 * 1024 * 1024)
        : 0;

      setStatsData((prev) => [
        { 
          ...prev[0], 
          value: Array.isArray(camerasData) ? camerasData.length.toLocaleString() : '0'
        },
        { 
          ...prev[1], 
          value: `${totalMediaSize.toFixed(2)} GB`
        },
        { 
          ...prev[2], 
          value: Array.isArray(alertsData) ? alertsData.length.toString() : '0'
        },
        { 
          ...prev[3], 
          value: Array.isArray(reportsData) ? reportsData.length.toString() : '0'
        },
        { 
          ...prev[4], 
          value: weatherData?.risk_level || '—', 
          badge: weatherData?.risk_level === 'Low' ? 'Clear Skies' : weatherData?.risk_level || '—'
        }
      ]);
    } catch (err) {
      console.error("Erreur stats:", err);
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setLoadingStats(false);
    }
  };

  // ✅ CORRECTION: fetchRecentMedia - données brutes de l'API
  const fetchRecentMedia = async () => {
    try {
      setLoadingMedia(true);
      const res = await axios.get("media/?ordering=-created_at&limit=5");
      
      const data = Array.isArray(res.data.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
      
      // ✅ Stocker les données brutes sans transformation trompeuse
      setMediaData(data);
    } catch (err) {
      console.error("Erreur médias:", err);
      setError("Erreur chargement médias");
    } finally {
      setLoadingMedia(false);
    }
  };

  // ✅ CORRECTION: fetchRecentAlerts - données brutes de l'API
  const fetchRecentAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const res = await axios.get("alerts/?ordering=-created_at&limit=5");
      
      const data = Array.isArray(res.data.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
      
      // ✅ Stocker les données brutes sans transformation trompeuse
      setAlertsData(data);
    } catch (err) {
      console.error("Erreur alertes:", err);
      setError("Erreur chargement alertes");
    } finally {
      setLoadingAlerts(false);
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
    fetchRecentMedia();
    fetchRecentAlerts();
  }, []);

  // ==================== HANDLERS ====================
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

  const handleNotificationsClick = () => {
    setNotificationsCount(0);
    alert('Notifications cleared!');
  };

  const handleQuickActionClick = async (action) => {
    try {
      switch (action.label) {
        case "Upload Media":
          alert("Upload Media: fonctionnalité à implémenter via modal");
          break;

        case "Create Camera":
          navigate("/admin/cameras/new");
          break;

        case "Generate Report":
          await axios.post("advanced-analytics/comprehensive_report/");
          alert("Rapport généré avec succès !");
          break;

        case "Weather Analysis":
          await axios.get("weather-analysis/analyze_impact/");
          alert("Analyse météo lancée !");
          break;

        default:
          break;
      }
    } catch (err) {
      console.error("Erreur action:", err);
      alert("Échec de l'action : veuillez réessayer.");
    }
  };

  // Fonction utilitaire pour obtenir l'icône basée sur le type MIME
  const getMediaIcon = (mimeType) => {
    if (!mimeType) return 'folder_zip';
    if (mimeType.includes('video')) return 'videocam';
    if (mimeType.includes('image')) return 'image';
    return 'folder_zip';
  };

  // ✅ CORRECTION: FILTRAGE DES DONNÉES (Ajoutez cette section AVANT return)
  
  // ✅ 1. Filtrer les médias valides
  const validMedia = mediaData.filter(
    (item) =>
      item &&
      (item.filename || item.name) &&
      item.created_at &&
      item.mime_type
  );

  // ✅ 2. Filtrer les alertes valides
  const validAlerts = alertsData.filter(
    (alert) =>
      alert &&
      alert.severity &&
      (alert.alert_type || alert.type) &&
      (alert.created_at || alert.timestamp)
  );

  // Fonction utilitaire pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    if (status === 'Processing') return 'blue';
    if (status === 'Queued') return 'yellow';
    return 'green';
  };

  // Fonction utilitaire pour obtenir la couleur de sévérité
  const getSeverityColor = (severity) => {
    if (severity === 'Critical') return 'red';
    if (severity === 'Warning') return 'yellow';
    return 'blue';
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] dark:text-white overflow-x-hidden min-h-screen flex flex-col">
      {/* TOP NAVIGATION */}
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
          <button 
            onClick={toggleDarkMode}
            className="flex items-center justify-center rounded-full size-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <button 
            onClick={handleNotificationsClick}
            className="flex items-center justify-center rounded-full size-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {notificationsCount > 0 && (
              <span className="absolute top-2 right-2.5 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            )}
          </button>
          
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

      {/* MAIN CONTENT */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* STATS */}
          <section>
            {loadingStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {statsData.map((stat) => (
                  <div 
                    key={stat.id}
                    className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-3">
                      <span className="material-symbols-outlined text-2xl">
                        {stat.icon}
                      </span>
                      <span className="text-sm font-medium">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-[#0d141b] dark:text-white mb-2">
                      {stat.value}
                    </p>
                    {stat.trend ? (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">trending_up</span>
                          {stat.trend}
                        </span>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                        stat.badge === 'Clear Skies' || stat.value === 'Low'
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20'
                          : stat.value === 'Medium'
                          ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/20'
                          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20'
                      }`}>
                        {stat.badge || stat.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* QUICK ACTIONS */}
          <section>
            <h3 className="text-lg font-bold text-[#0d141b] dark:text-white mb-5">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickActionClick(action)}
                  className="h-28 bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 text-[#0d141b] dark:text-white font-semibold text-base transition-all hover:shadow-md hover:border-primary/30 hover:dark:border-primary/30"
                >
                  <span className="material-symbols-outlined text-3xl text-primary">
                    {action.icon}
                  </span>
                  <span className="text-center px-2">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* TABLEAUX */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ✅ CORRECTION: Médias - données brutes */}
            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <h3 className="text-base font-bold text-[#0d141b] dark:text-white">
                  {loadingMedia ? 'Chargement...' : 'Recent Media Uploads'}
                </h3>
                <NavLink to="/admin/media" className="text-primary text-sm font-medium hover:underline">
                  View All
                </NavLink>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">FILE</th>
                      <th className="px-6 py-4 text-left font-semibold">TYPE</th>
                      <th className="px-6 py-4 text-left font-semibold">STATUS</th>
                      <th className="px-6 py-4 text-right font-semibold">TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {loadingMedia ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded bg-slate-200 dark:bg-slate-700"></div>
                              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : validMedia.length > 0 ? (
                      validMedia.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-[#0d141b] dark:text-white flex items-center gap-3">
                            <div className="size-9 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                              <span className="material-symbols-outlined text-lg">
                                {getMediaIcon(item.mime_type)}
                              </span>
                            </div>
                            <span className="truncate max-w-[180px]">
                              {item.filename || item.name || 'Unnamed file'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {item.mime_type ? 
                              (item.mime_type.includes('video') ? 'Video' : 
                               item.mime_type.includes('image') ? 'Image' : 'File')
                              : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                              item.status === 'Processing' 
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/20'
                                : item.status === 'Queued'
                                ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/20'
                                : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20'
                            }`}>
                              {item.status || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatRelativeTime(item.created_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                          Aucun média récent
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ CORRECTION: Alertes - données brutes */}
            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <h3 className="text-base font-bold text-[#0d141b] dark:text-white">
                  {loadingAlerts ? 'Chargement...' : 'Recent Alerts'}
                </h3>
                <NavLink to="/admin/alerts" className="text-primary text-sm font-medium hover:underline">
                  View All
                </NavLink>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">SEVERITY</th>
                      <th className="px-6 py-4 text-left font-semibold">TYPE</th>
                      <th className="px-6 py-4 text-left font-semibold">CAMERA</th>
                      <th className="px-6 py-4 text-right font-semibold">TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {loadingAlerts ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : validAlerts.length > 0 ? (
                      validAlerts.map((alert) => (
                        <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium ${
                              alert.severity === 'Critical'
                                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-inset ring-red-600/10 dark:ring-red-500/20'
                                : alert.severity === 'Warning'
                                ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/10 dark:ring-yellow-500/20'
                                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/10 dark:ring-blue-500/20'
                            }`}>
                              {alert.severity || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-[#0d141b] dark:text-white">
                            {alert.alert_type || alert.type || '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {alert.camera_name || alert.source || '—'}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatRelativeTime(alert.created_at || alert.timestamp)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                          Aucune alerte récente
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
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
              ©️ {new Date().getFullYear()} SafeBorder AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;