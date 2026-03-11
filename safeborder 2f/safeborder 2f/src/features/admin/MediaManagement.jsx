import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from "../../services/api";

const MediaManagement = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');

  const [mediaHistory, setMediaHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   
  const fileInputRef = React.useRef(null);

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
  };

 const handleBrowseFiles = () => {
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
};

  const handleMediaAction = (filename, action) => {
    console.log(`${action} for ${filename}`);
  };

  // ✅ Navigation avec React Router
  const navItems = [
    
    { id: 2, label: 'Caméras', path: '/admin/cameras' },
    { id: 3, label: 'Média', path: '/admin/media' },
    { id: 4, label: 'Alerts', path: '/admin/alerts' },
    { id: 5, label: 'Weather', path: '/admin/weather' },
    { id: 6, label: 'Reports', path: '/admin/reports' },
    { id: 7, label: 'Analytics', path: '/admin/analytics' },
  ];

  // ✅ Fonction pour formater la taille
  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // ✅ Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ CHARGEMENT DYNAMIQUE sans fake data
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const res = await axios.get("media/");
        
        // ✅ Gestion des différents formats de réponse API
        const data = Array.isArray(res.data.results) ? res.data.results : 
                    (Array.isArray(res.data) ? res.data : []);
        
        // ✅ Mapping sans valeurs par défaut - seulement "—" si null/undefined
        const mappedData = data.map(item => {
          // ✅ uploaded_by - pas de "Unknown", seulement "—"
          const uploadedByUsername = item.uploaded_by_username || 
                                   (typeof item.uploaded_by === 'object' ? item.uploaded_by?.username : null);
          
          // ✅ Initiales seulement si username existe
          const userInitials = uploadedByUsername ? 
            uploadedByUsername.slice(0, 2).toUpperCase() : "—";
          
          // ✅ camera - pas de valeur par défaut
          const assignedCamera = item.camera_name || 
                               (typeof item.camera === 'object' ? item.camera?.name : null);
          
          return {
            id: item.id,
            // ✅ PAS de "Unknown file" - seulement "—"
            filename: item.filename || item.name || "—",
            // ✅ Calcul de taille à partir de file_size (bytes)
            size: formatFileSize(item.file_size),
            // ✅ Formatage date
            date: formatDate(item.created_at || item.uploaded_at),
            // ✅ PAS de "Unknown" - seulement "—"
            uploadedBy: uploadedByUsername || "—",
            userInitials: userInitials,
            // ✅ Pas de userColor - c'était fake
            assignedCamera: assignedCamera,
            // ✅ PAS de "Queued" par défaut - seulement "—"
            status: item.status || "—",
            thumbnail: item.thumbnail || null,
            // Données brutes pour référence
            raw: item
          };
        });
        
        setMediaHistory(mappedData);
      } catch (err) {
        console.error("❌ Error loading media:", err);
        setError("Failed to load media files");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  // ✅ PAS de dropdown fake - seulement si API existe
  const recentMediaForDropdown = mediaHistory
    .filter(media => !media.assignedCamera || media.assignedCamera === "—")
    .slice(0, 3);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#0d141b] dark:text-white overflow-x-hidden min-h-screen flex flex-col">
      {/* ✅ TOP NAVIGATION avec React Router */}
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
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-3 px-1">
            <div className="flex min-w-72 flex-col gap-2">
              <h1 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                Media Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                Manage, upload, and assign simulation assets to active surveillance nodes.
              </p>
            </div>
            <div className="flex items-end">
              <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                System Status: Operational
              </span>
            </div>
          </div>

          {/* ✅ Top Section: Upload & Assign - Section Assign supprimée car API non disponible */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload Section - seulement cette partie car l'assignation n'existe pas */}
            <div className="lg:col-span-12 flex flex-col">
              <h3 className="text-[#0d141b] dark:text-white tracking-tight text-lg font-bold leading-tight pb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">cloud_upload</span>
                Upload Media
              </h3>
              <div className="flex flex-1 flex-col bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm h-full">
                <div 
                  
                  className="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer px-6 py-12 group"
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="size-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-primary text-3xl">image</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#0d141b] dark:text-white text-lg font-bold">
                        Drag & Drop files here
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Supported formats: MP4, JPG, PNG (Max 500MB)
                      </p>
                    </div>
                  </div>
      <button
  type="button"
  onClick={handleBrowseFiles}
  className="flex items-center justify-center gap-2 rounded-lg h-10 px-6 bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-md transition-all"
>
  <span className="material-symbols-outlined text-[18px]">folder_open</span>
  Browse Files
</button>

<input
  type="file"
  ref={fileInputRef}
  style={{ display: "none" }}
  accept="image/*,video/*"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "media_type",
        file.type.startsWith("video") ? "video" : "image"
      );

      await axios.post("media/upload_media/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 🔄 إعادة تحميل القائمة
      const res = await axios.get("media/");
      const data = Array.isArray(res.data.results)
        ? res.data.results
        : res.data;

      setMediaHistory(data.map(item => ({
        id: item.id,
        filename: item.file ? item.file.split("/").pop() : "—",
        size: formatFileSize(item.file_size),
        date: formatDate(item.uploaded_at),
        uploadedBy: item.uploaded_by_username || "—",
        userInitials: item.uploaded_by_username
          ? item.uploaded_by_username.slice(0, 2).toUpperCase()
          : "—",
        assignedCamera: item.camera_name || "—",
        status: item.processed ? "Processed" : "Pending",
        raw: item
      })));

      // 🔁 مهم جدًا: يسمح باختيار نفس الملف مرة أخرى
      e.target.value = null;

    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Upload failed");
    }
  }}
/>
                </div>
              </div>
            </div>
  
            {/* ✅ Section Assign supprimée - API non disponible */}
          </div>

          {/* ✅ Media History Table sans fake data */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-[#0d141b] dark:text-white tracking-tight text-xl font-bold leading-tight">
                  Media History
                </h3>
                {!loading && !error && (
                  <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
                    {mediaHistory.length} files
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <input 
                    className="h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] text-sm focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Search filename..."
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">
                    search
                  </span>
                </div>
                <button className="flex items-center gap-1 px-3 h-9 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  Filter
                </button>
              </div>
            </div>
            
            <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2632] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Preview</th>
                      <th className="px-6 py-4">Filename</th>
                      <th className="px-6 py-4">Uploaded By</th>
                      <th className="px-6 py-4">Assigned Camera</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined animate-spin text-primary text-xl">sync</span>
                            <p className="text-slate-500">Loading media files...</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <p className="text-red-500 font-medium">{error}</p>
                            <button 
                              onClick={() => window.location.reload()}
                              className="text-sm text-primary hover:underline"
                            >
                              Try again
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : mediaHistory.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-xl">folder_off</span>
                            <p className="text-slate-500">No media files found</p>
                            <p className="text-slate-400 text-sm">Upload your first media file to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      mediaHistory.map((media) => (
                        <tr key={media.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-3">
                            <div className="size-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                              {media.thumbnail ? (
                                <img 
                                  alt="Media thumbnail" 
                                  className="h-full w-full object-cover"
                                  src={media.thumbnail}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.parentElement.innerHTML = `
                                      <div class="h-full w-full flex items-center justify-center text-slate-300">
                                        <span class="material-symbols-outlined text-2xl">broken_image</span>
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                  <span className="material-symbols-outlined text-2xl">folder_zip</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-[#0d141b] dark:text-white truncate max-w-[200px]">
                                {media.filename}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{media.size}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{media.date}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              {/* ✅ Badge simple sans couleur fake */}
                              <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {media.userInitials}
                              </div>
                              <span className="text-[#0d141b] dark:text-white">
                                {media.uploadedBy}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            {media.assignedCamera && media.assignedCamera !== "—" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-[14px]">videocam</span>
                                <span className="truncate max-w-[120px]">{media.assignedCamera}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            {/* ✅ Status sans valeurs fake */}
                            {media.status && media.status !== "—" ? (
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                                media.status === 'Processing' 
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30"
                                  : media.status === 'Failed' 
                                  ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
                                  : media.status === 'Processed' 
                                  ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
                                  : "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                              }`}>
                                {media.status === 'Processing' ? (
                                  <span className="size-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                                ) : media.status === 'Failed' ? (
                                  <span className="material-symbols-outlined text-[14px]">error</span>
                                ) : media.status === 'Processed' ? (
                                  <span className="size-1.5 rounded-full bg-green-500"></span>
                                ) : (
                                  <span className="size-1.5 rounded-full bg-slate-400"></span>
                                )}
                                {media.status}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() => {
                                window.open(
                                 `${axios.defaults.baseURL}media/${media.id}/download/`,
                                 "_blank"
                               );
                             }}
                             className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                             <span className="material-symbols-outlined text-[18px]">
                               download
                             </span>
                             Download
                           </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* ✅ Footer avec statistiques réelles */}
              {!loading && !error && mediaHistory.length > 0 && (
                <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Showing {mediaHistory.length} media files
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        {/* ✅ Calcul de taille à partir des données brutes */}
                        Total size: {mediaHistory.reduce((sum, media) => {
                          const bytes = media.raw?.file_size || 0;
                          return sum + bytes;
                        }, 0) / (1024 * 1024 * 1024) > 1 
                          ? `${(mediaHistory.reduce((sum, media) => {
                              const bytes = media.raw?.file_size || 0;
                              return sum + bytes;
                            }, 0) / (1024 * 1024 * 1024)).toFixed(2)} GB`
                          : `${(mediaHistory.reduce((sum, media) => {
                              const bytes = media.raw?.file_size || 0;
                              return sum + bytes;
                            }, 0) / (1024 * 1024)).toFixed(2)} MB`}
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
        </div>
      </main>

      {/* ✅ Footer avec année ديناميكية */}
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

export default MediaManagement;