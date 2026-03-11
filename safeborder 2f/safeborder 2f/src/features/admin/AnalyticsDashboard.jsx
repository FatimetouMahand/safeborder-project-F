import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from "../../services/api";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // 🔥 البيانات الحقيقية من الـ APIs
  
  const [comprehensiveData, setComprehensiveData] = useState(null);
  const [curveData, setCurveData] = useState([]);
  const [error, setError] = useState(null);
  
  const location = useLocation();

  const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/login");
};

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

  // 🔥 جلب كل البيانات من الـ APIs الحقيقية
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // جلب البيانات من الـ 3 APIs في نفس الوقت
       const [alertsRes, curveRes] = await Promise.all([
  axios.get("alerts/"),
  axios.get("advanced-analytics/risk_curve/")
]);



setCurveData(curveRes.data);

const alerts = alertsRes.data.results || alertsRes.data || [];
console.log("ALERTS DATA:", alerts);



setComprehensiveData({
  alerts: alerts,
  curve: curveRes.data
});
        
        
        
      } catch (err) {
        console.error("❌ Error loading analytics:", err);
        setError(err.response?.data?.detail || err.message || 'Failed to load analytics data');
        
        // البيانات الافتراضية في حالة الخطأ (للعرض فقط)
     
        
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchAnalyticsData();
    }
  }, [mounted]);


  const generatePath = () => {

  if (!curveData || curveData.length === 0) {
    return "M0 45 L100 45";
  }

  const max = Math.max(...curveData.map(p => p.total), 1);

  const points = curveData.map((p, i) => {

    const x = (i / (curveData.length - 1)) * 100;
    const y = 45 - ((p.total / max) * 40);

    return `${x} ${y}`;
  });

  return `M ${points.join(" L ")}`;
};

  const navItems = [
   
    { id: 2, label: 'Caméras', path: '/admin/cameras', icon: 'videocam' },
    { id: 3, label: 'Média', path: '/admin/media', icon: 'photo_library' },
    { id: 4, label: 'Alerts', path: '/admin/alerts', icon: 'notifications' },
    { id: 5, label: 'Weather', path: '/admin/weather', icon: 'cloud' },
    { id: 6, label: 'Reports', path: '/admin/reports', icon: 'description' },
    { id: 7, label: 'Analytics', path: '/admin/analytics', icon: 'analytics', active: true },
  ];

  // حساب التغيرات والنسب المئوية
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, type: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      type: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
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
              Admin Analytics
            </span>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-8">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`${location.pathname === item.path
                  ? 'text-primary text-sm font-bold border-b-2 border-primary pb-1' 
                  : 'text-[#0d141b] dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium'
                } whitespace-nowrap tracking-wide flex items-center gap-1`}
              >
                <span className="material-symbols-outlined text-base">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex gap-4 items-center">
          
          
          <div className="flex items-center gap-3 rounded-xl pl-2 pr-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
            <div className="size-9 rounded-full bg-slate-300 dark:bg-slate-600 overflow-hidden">
              <img 
                alt="Profile" 
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh75uF-MQvNu3NfqgmKuxAPloAir1tJcDGpK8tPU5Pfia-FIcN3kBR02aSEPVc1cVWufETRZE3Cg7a022lyPQiqxVvcVCqDHjYmaZ37B0i6-CVyU03ALJsJDkJ54Yx7InYTzVuGoB0wGL0zRCxgZ2VujBRB-6Xqfgaf8IjuA6WuoUuuQ76vNjqzSZi09voVvJpdP9fnFrwglS8NZZB5SrvBkVXiiARiQxNPdoIhnc8UPhwZ1MiztKBhvi2BTtde4Jt4Pc3x1OQMNo"
              />
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#0d141b] dark:text-white">Admin_User</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Super Admin</p>
            </div>
            <button
    onClick={handleLogout}
    className="flex items-center justify-center rounded-full size-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-red-500 hover:text-red-600"
    title="Log Out"
  >
    <span className="material-symbols-outlined text-xl">logout</span>
  </button>
            
          </div>
          
        </div>

        
      </header>
      

      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141b] dark:text-white text-3xl md:text-4xl font-bold tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                Unified insights for traffic patterns, weather impact, and risk assessment.
              </p>
              {error && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span className="text-sm">Warning: {error} (Showing demo data)</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                <button className="px-4 py-1.5 text-sm font-medium rounded text-white bg-primary shadow-sm transition-all">
                  24h
                </button>
                <button className="px-4 py-1.5 text-sm font-medium rounded text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0d141b] dark:hover:text-white transition-all">
                  7d
                </button>
                <button className="px-4 py-1.5 text-sm font-medium rounded text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0d141b] dark:hover:text-white transition-all">
                  30d
                </button>
              </div>
              
              <button className="flex items-center gap-2 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors shadow-sm">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
                Custom Range
              </button>
              
              <button className="flex items-center gap-2 bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:bg-blue-600 transition-colors">
                <span className="material-symbols-outlined text-lg">download</span>
                Export Report
              </button>
            </div>
          </div>



          {/* Main Chart Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Traffic & Incident Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">AI Risk Evolution</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Risk evolution based on detected alerts
                    
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></span> AI Risk Evolution
                    <span className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-500 ml-2"></span> Incidents
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full relative min-h-[300px]">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {/* Y-axis grid lines */}
                  <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                  <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                  <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                  <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                  <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
                  
                  {/* Chart SVG Path */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                    {/* Area fill */}
                    <path d="M0 45 Q 10 40, 20 35 T 40 25 T 60 30 T 80 15 T 100 20 V 50 H 0 Z" fill="#137fec" fillOpacity="0.1"></path>
                    {/* Line */}
                    <path 
                    d={generatePath()}
                    fill="none"
                    stroke="#137fec"
                    strokeWidth="0.8"  >
                      
                    </path>
                    {/* Incident Points (Red dots) */}
                    <circle cx="20" cy="35" fill="#ef4444" r="1"></circle>
                    <circle cx="60" cy="30" fill="#ef4444" r="1"></circle>
                    <circle cx="80" cy="15" fill="#ef4444" r="1"></circle>
                  </svg>
                </div>
                <div className="absolute bottom-[-24px] w-full flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                  <span>24:00</span>
                </div>
              </div>
            </div>

            {/* AI Insights Card - 🔥 حقيقي من Threat Patterns */}
            <div className="lg:col-span-1 bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">
AI Insights
</h3>

{comprehensiveData?.alerts?.length > 0 && (
  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">

    <p className="text-sm font-semibold mb-2">
      Advanced AI Analysis
    </p>

    <pre className="text-xs whitespace-pre-wrap">
  {comprehensiveData.alerts.find(a => a.advanced_analysis)?.advanced_analysis 
    || "No AI analysis available"}
    </pre>

  </div>
)}
              </div>
              
              
             
            </div>
          </section>

          {/* Reports Distribution & Performance */}
          
   
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
              ©️ 2024 SafeBorder AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnalyticsDashboard;