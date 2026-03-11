import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";

const WeatherDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [weatherList, setWeatherList] = useState([]);
  const [impact, setImpact] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const navigate = useNavigate();

  /* ===============================
     DARK MODE
  =============================== */
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    document.body.classList.toggle("dark", next);
  };

  useEffect(() => {
    if (!mounted) return;
    
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    }
  }, [mounted]);

  /* ===============================
     ✅✅✅ CORRECTION CRITIQUE: FETCH WEATHER DATA
  =============================== */
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🌤️ Fetching weather data...");
        
        // ✅ الحل: جلب البيانات بشكل منفصل، ليس باستخدام Promise.all
        try {
          // 1. جلب بيانات الطقس الأساسية
          const weatherRes = await axios.get("weather/");
          console.log("✅ Weather API Response:", weatherRes.data);
          
          let weatherData = [];
          if (Array.isArray(weatherRes.data)) {
            weatherData = weatherRes.data;
          } else if (weatherRes.data && Array.isArray(weatherRes.data.results)) {
            weatherData = weatherRes.data.results;
          } else if (weatherRes.data && typeof weatherRes.data === 'object') {
            weatherData = Object.values(weatherRes.data);
          }
          
          setWeatherList(weatherData);
          console.log("📊 Processed weather data:", weatherData.length, "records");
          
        } catch (weatherErr) {
          console.error("❌ Error fetching weather:", weatherErr);
          setWeatherList([]);
        }
        
        // 2. جلب تحليل التأثير (إن وجد)
        try {
          const impactRes = await axios.get("weather-analysis/analyze/");
          console.log("✅ Impact API Response:", impactRes.data);
          setImpact(impactRes.data || null);
        } catch (impactErr) {
          console.warn("⚠️ Impact endpoint not available:", impactErr.response?.status);
          setImpact(null);
        }
        
        // 3. جلب التوقعات (إن وجد)
        try {
          const predictRes = await axios.get("weather-analysis/predict_risk/");
setPrediction(predictRes.data);
          console.log("✅ Prediction API Response:", predictRes.data);
          setPrediction(predictRes.data || null);
        } catch (predictErr) {
          console.warn("⚠️ Prediction endpoint not available:", predictErr.response?.status);
          setPrediction(null);
        }
        
      } catch (err) {
        console.error("❌ General error:", err);
        setError("Unable to load weather data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const latestWeather = weatherList?.[0];

  // ✅ Navigation items with routes
  const navItems = [
    
    { id: 2, label: 'Caméras', path: '/admin/cameras', active: false },
    { id: 3, label: 'Média', path: '/admin/media', active: false },
    { id: 4, label: 'Alerts', path: '/admin/alerts', active: false },
    { id: 5, label: 'Weather', path: '/admin/weather', active: true },
    { id: 6, label: 'Reports', path: '/admin/reports', active: false },
    { id: 7, label: 'Analytics', path: '/admin/analytics', active: false },
  ];

  const handleNavigation = (path) => {
    navigate(path);
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
            <div>
              <h2 className="text-[#0d141b] dark:text-white text-xl font-bold tracking-tight">
                SafeBorder AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weather Dashboard • {weatherList.length} weather records
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
                  item.active 
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

      {/* MAIN CONTENT */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141b] dark:text-white text-3xl md:text-4xl font-bold tracking-tight">
                Weather Analysis Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Real-time weather conditions and impact on border surveillance
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
                <span className="font-semibold">System Status</span>
              </div>
              <button 
                onClick={() => {
                  console.log("Weather data:", weatherList);
                  console.log("Impact data:", impact);
                  console.log("Prediction data:", prediction);
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Show Console
              </button>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Weather Records: {weatherList.length} | Status: {loading ? 'Loading...' : error ? 'Error' : 'Ready'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">error</span>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-500 dark:text-slate-400">Loading weather data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Temperature */}
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">Temperature</p>
                    <span className="material-symbols-outlined text-primary bg-blue-100 dark:bg-blue-900/20 p-1.5 rounded-lg text-lg">thermostat</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">
                      {latestWeather?.temperature ?? "—"} °C
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        {latestWeather?.weather_condition || 'Condition not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visibility */}
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">Visibility</p>
                    <span className="material-symbols-outlined text-primary bg-blue-100 dark:bg-blue-900/20 p-1.5 rounded-lg text-lg">visibility</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">
                      {latestWeather?.visibility ?? "—"} km
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        (latestWeather?.visibility || 0) > 10 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : (latestWeather?.visibility || 0) > 5
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {(latestWeather?.visibility || 0) > 10 ? 'Good' : 
                         (latestWeather?.visibility|| 0) > 5 ? 'Average' : 'Poor'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Wind */}
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">Wind Speed</p>
                    <span className="material-symbols-outlined text-primary bg-blue-100 dark:bg-blue-900/20 p-1.5 rounded-lg text-lg">air</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">
                      {latestWeather?.wind_speed ?? "—"} km/h
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        Direction: {latestWeather?.wind_direction || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Weather Risk */}
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">Weather Risk</p>
                    <span className="material-symbols-outlined text-primary bg-blue-100 dark:bg-blue-900/20 p-1.5 rounded-lg text-lg">warning</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">
                      {prediction?.predicted_risk_level || prediction?.risk_level || "—"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        prediction?.predicted_risk_level === 'Low' || prediction?.risk_level === 'Low'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : prediction?.predicted_risk_level === 'Medium' || prediction?.risk_level === 'Medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        Confidence: {prediction?.confidence || "—"}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Impact Analysis */}
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">Surveillance Impact</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {impact?.impact_analysis || impact?.analysis || "No impact analysis available at this time."}
                      </p>
                    </div>
                    
                    {impact?.recommendations && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-green-600 dark:text-green-400">lightbulb</span>
                          <p className="font-medium text-green-800 dark:text-green-300">Recommendations</p>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          {impact.recommendations}
                        </p>
                      </div>
                    )}
                    
                    {latestWeather?.humidity !== undefined && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">humidity_percentage</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">Humidity</span>
                        </div>
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                          {latestWeather.humidity}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk Prediction & Details */}
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">Risk Prediction</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      prediction?.predicted_risk_level === 'High' || prediction?.risk_level === 'High'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                        : prediction?.predicted_risk_level === 'Medium' || prediction?.risk_level === 'Medium'
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${
                            prediction?.predicted_risk_level === 'High' || prediction?.risk_level === 'High'
                              ? 'bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400'
                              : prediction?.predicted_risk_level === 'Medium' || prediction?.risk_level === 'Medium'
                              ? 'bg-orange-100 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400'
                              : 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400'
                          }`}>
                            <span className="material-symbols-outlined">
                              {prediction?.predicted_risk_level === 'High' || prediction?.risk_level === 'High'
                                ? 'warning' 
                                : 'insights'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0d141b] dark:text-white">
                              Risk Level: {prediction?.predicted_risk_level || prediction?.risk_level || "—"}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Confidence: {prediction?.confidence || "—"}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="font-medium text-[#0d141b] dark:text-white mb-2">Analysis Timeframe</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {prediction?.timeframe || "No timeframe specified"}
                      </p>
                    </div>
                    
                    {latestWeather?.pressure !== undefined && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">compress</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">Atmospheric Pressure</span>
                        </div>
                        <span className="text-lg font-bold text-purple-700 dark:text-purple-400">
                          {latestWeather.pressure} hPa
                        </span>
                      </div>
                    )}
                    
                    {latestWeather?.recorded_at && (
                      <div className="text-center p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary">
                          Last update: {new Date(latestWeather.recorded_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Weather Data */}
              {weatherList.length > 0 && (
                <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">history</span>
                      <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">Recent Weather Data</h3>
                    </div>
                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                      {weatherList.length} records
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Time</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Temperature</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Visibility</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Wind</th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Condition</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {weatherList.slice(0, 5).map((weather, index) => (
                          <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                              {weather.timestamp ? new Date(weather.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-[#0d141b] dark:text-white">
                              {weather.temperature ?? "—"} °C
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                              {weather.visibility_km ?? "—"} km
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                              {weather.wind_speed ?? "—"} km/h
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                weather.condition === 'Clear' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : weather.condition === 'Cloudy' || weather.condition === 'Overcast'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}>
                                {weather.condition || '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
              <button onClick={() => navigate('/admin/privacy')} className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => navigate('/admin/terms')} className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                Terms of Service
              </button>
              <button onClick={() => navigate('/admin/support')} className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                Support
              </button>
              <button onClick={() => navigate('/admin/contact')} className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                Contact
              </button>
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

export default WeatherDashboard;