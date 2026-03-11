import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from "../../services/api";

const CameraManagement = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(1);
  const [activeView, setActiveView] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle dark mode
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

  // Initialize dark mode
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
    // alert('Notifications cleared!');
  };

  // ✅ CORRECTION: Navigation avec React Router
  const navItems = [
   
    { id: 2, label: 'Caméras', path: '/admin/cameras' },
    { id: 3, label: 'Média', path: '/admin/media' },
    { id: 4, label: 'Alerts', path: '/admin/alerts' },
    { id: 5, label: 'Weather', path: '/admin/weather' },
    { id: 6, label: 'Reports', path: '/admin/reports' },
    { id: 7, label: 'Analytics', path: '/admin/analytics' },
  ];

  // Charger les caméras
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await api.get("cameras/");
        // ✅ CORRECTION: Handle API response format
        const data = Array.isArray(res.data.results) ? res.data.results : res.data;
        setCameras(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error loading cameras:", err);
        setError("Failed to load cameras");
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, []);

  // ✅ CORRECTION: Mapping backend → UI avec normalisation sécurisée
  const mapCameraToUI = (camera) => {
    // Normalisation des valeurs pour éviter les erreurs
    const status = (camera.status || "").toLowerCase();
    const cameraType = (camera.camera_type || "").toLowerCase();
    
    return {
      id: camera.id,
      name: camera.name || "Unnamed Camera",
      cameraId: camera.code || camera.serial_number || `CAM-${camera.id}`,
      type: cameraType === "simulation" ? "Simulation" : "Real",
      status: status === "online" ? "Online" : "Offline",
      statusColor: status === "online" ? "success" : "slate",
      ipAddress: camera.ip_address || camera.ip || "N/A",
      region: camera.region || camera.zone || "Unknown",
      // ✅ CORRECTION: Utiliser les bons noms de champs
      coordinates:
        camera.location_lat && camera.location_lng
          ? `${camera.location_lat}°, ${camera.location_lng}°`
          : (camera.latitude && camera.longitude
            ? `${camera.latitude}°, ${camera.longitude}°`
            : "--.--°, --.--°"),
      thumbnail: camera.thumbnail || "https://placeholder.pics/svg/300",
      // Données brutes pour référence
      raw: camera
    };
  };

  // ✅ CORRECTION: STATS DYNAMIQUES avec données mappées
  const mappedCameras = cameras.map(mapCameraToUI);
  
  const statsData = [
    {
      id: 1,
      label: "Total Assets",
      value: mappedCameras.length,
      icon: "videocam",
    },
    {
      id: 2,
      label: "Real Cameras",
      value: mappedCameras.filter(c => c.type === "Real").length,
      icon: "linked_camera",
      color: "primary",
      borderColor: "border-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 3,
      label: "Simulations",
      value: mappedCameras.filter(c => c.type === "Simulation").length,
      icon: "science",
      color: "purple",
      borderColor: "border-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      id: 4,
      label: "Offline",
      value: mappedCameras.filter(c => c.status !== "Online").length,
      icon: "wifi_off",
      color: "danger",
      borderColor: "border-danger",
      bgColor: "bg-danger/10",
    },
  ];

  // ✅ CORRECTION: FILTRAGE FRONTEND sur données mappées
  const filteredCameras = mappedCameras.filter((camera) => {
    if (activeView === "Real" && camera.type === "Simulation") return false;
    if (activeView === "Simulation" && camera.type !== "Simulation") return false;

    if (statusFilter !== "All") {
      if (statusFilter === "Offline" && camera.status === "Online") return false;
      if (statusFilter === "Active" && camera.status !== "Online") return false;
      if (statusFilter === "Maintenance" && camera.status !== "Maintenance") return false;
    }

    return true;
  });

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] dark:text-white overflow-x-hidden min-h-screen flex flex-col">
      {/* ✅ CORRECTION: TOP NAVIGATION avec React Router */}
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

      {/* MAIN CONTENT */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <NavLink 
              className="text-slate-500 hover:text-primary transition-colors" 
              to="/admin/dashboard"
            >
              Dashboard
            </NavLink>
            <span className="text-slate-300">/</span>
            <span className="text-[#0d141b] dark:text-white font-medium">Cameras</span>
          </div>

          {/* Page Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-[#0d141b] dark:text-white tracking-tight mb-2">
                Camera Inventory
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Manage real surveillance assets and virtual simulations
              </p>
            </div>
            {/* Bouton "Add Camera" caché - à implémenter plus tard */}
            <button 
              className="opacity-0 pointer-events-none h-10 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              disabled
            >
              Add Camera
            </button>
          </div>

          {/* ✅ Stats Overview — DYNAMIQUE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsData.map((stat) => (
              <div 
                key={stat.id}
                className={`bg-white dark:bg-[#1a2632] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between ${
                  stat.borderColor || ''
                }`}
              >
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${
                    stat.color === 'primary' ? 'text-primary' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    stat.color === 'danger' ? 'text-danger' :
                    'text-[#0d141b] dark:text-white'
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-full ${
                  stat.bgColor || 'bg-slate-100 dark:bg-slate-800'
                } flex items-center justify-center ${
                  stat.color === 'primary' ? 'text-primary' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  stat.color === 'danger' ? 'text-danger' :
                  'text-slate-500'
                }`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                placeholder="Search by ID, Name, IP, or Coordinates..."
                type="text"
              />
            </div>
            
            <div className="flex w-full lg:w-auto gap-3 overflow-x-auto pb-2 lg:pb-0">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveView('All')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeView === 'All' 
                      ? 'bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white shadow-sm' 
                      : 'text-slate-500 hover:text-[#0d141b] dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveView('Real')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeView === 'Real' 
                      ? 'bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white shadow-sm' 
                      : 'text-slate-500 hover:text-[#0d141b] dark:hover:text-white'
                  }`}
                >
                  Real
                </button>
                <button 
                  onClick={() => setActiveView('Simulation')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeView === 'Simulation' 
                      ? 'bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white shadow-sm' 
                      : 'text-slate-500 hover:text-[#0d141b] dark:hover:text-white'
                  }`}
                >
                  Simulation
                </button>
              </div>
              
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 self-center hidden md:block"></div>
              
              <div className="relative min-w-[140px]">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="All">Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Offline">Offline</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Gestion loading / error */}
          {loading && (
            <div className="text-center text-slate-500 py-10">
              <div className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin">sync</span>
                Loading cameras...
              </div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-10">
              <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            </div>
          )}

          {/* ✅ Camera Grid — FILTRÉ avec données mappées */}
          {!loading && !error && (
            <>
              {filteredCameras.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-3 text-slate-400">
                    <span className="material-symbols-outlined text-4xl">videocam_off</span>
                    <p className="text-lg font-medium">No cameras found</p>
                    <p className="text-sm">Try changing your filters</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCameras.map((camera) => (
                    <div 
                      key={camera.id}
                      className="group bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      {/* Card Header */}
                      <div className="relative h-40 bg-slate-200 overflow-hidden">
                        <div 
                          className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${
                            camera.type === 'Simulation' ? 'grayscale' : ''
                          } ${camera.status === 'Offline' ? 'opacity-70' : ''}`}
                          style={{ backgroundImage: `url(${camera.thumbnail})` }}
                        ></div>
                        <div className={`absolute inset-0 ${
                          camera.type === 'Simulation' 
                            ? 'bg-purple-900/20 mix-blend-multiply' 
                            : 'bg-gradient-to-t from-black/60 to-transparent'
                        }`}></div>
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2 py-1 rounded-md ${
                            camera.type === 'Real' ? 'bg-primary' : 'bg-purple-600'
                          } text-white text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
                            {camera.type === 'Real' ? 'Real' : 'Sim'}
                          </span>
                        </div>
                        
                        {/* Status */}
                        <div className="absolute top-3 right-3">
                          <span className={`flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            camera.status === 'Online' ? 'text-success' : 'text-slate-500'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              camera.status === 'Online' ? 'bg-success animate-pulse' : 'bg-slate-400'
                            }`}></span>
                            {camera.status}
                          </span>
                        </div>
                        
                        {/* Coordinates */}
                        <div className="absolute bottom-3 left-3 text-white text-xs font-mono flex items-center gap-1 opacity-90">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {camera.coordinates}
                        </div>
                      </div>
                      
                      {/* Card Body */}
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-[#0d141b] dark:text-white font-bold text-base">
                              {camera.name}
                            </h3>
                            <p className="text-slate-500 text-xs mt-0.5">ID: {camera.cameraId}</p>
                          </div>
                          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600 dark:text-slate-400 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold">
                              {camera.type === 'Real' ? 'IP Address' : 'Instance'}
                            </span>
                            <span className={`font-mono ${camera.status === 'Offline' ? 'text-slate-400 line-through' : ''}`}>
                              {camera.ipAddress}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold">
                              {camera.type === 'Real' ? 'Region' : 'Scenario'}
                            </span>
                            <span>{camera.region}</span>
                          </div>
                        </div>
                        
                        {/* ✅ Action Buttons */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                          <button 
                            className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1"
                            onClick={() => console.log('View details:', camera)}
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            View
                          </button>
                          <button 
                            className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1"
                            onClick={() => console.log('Edit camera:', camera)}
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* ✅ Stats Summary Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">info</span>
                      Showing {filteredCameras.length} of {mappedCameras.length} cameras
                    </span>
                    {activeView !== 'All' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                        <span className="material-symbols-outlined text-sm">filter_alt</span>
                        Filter: {activeView}
                      </span>
                    )}
                  </div>
                  <div className="text-xs">
                    Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            </>
          )}
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

export default CameraManagement;