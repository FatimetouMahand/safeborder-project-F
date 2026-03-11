// src/features/fisherman/FishermanDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFishermanDashboard } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function FishermanDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState([
    { id: "total", value: 0, label: "Total Reports Submitted" },
    { id: "approved", value: 0, label: "Approved This Month" },
  ]);

  const [recentReports, setRecentReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 Attendre que l'authentification soit complète
  useEffect(() => {
    if (authLoading) return; // Attendre la fin du chargement auth

    const loadDashboard = async () => {
      if (!user) {
        console.error("No user data available");
        setError("Aucune donnée utilisateur disponible");
        setDashboardLoading(false);
        return;
      }

      setDashboardLoading(true);
      setError(null);

      try {
        const response = await fetchFishermanDashboard();
        const data = response.data;

        console.log("DASHBOARD DATA FROM API:", data);

        setStats([
          {
            id: "total",
            value: data.total_reports ?? 0,
            label: "Total Reports Submitted",
          },
          {
            id: "approved",
            value: data.approved_this_month ?? 0,
            label: "Approved This Month",
          },
        ]);

        setRecentReports(data.recent_reports || []);
        setAnnouncements(data.announcements || []);
      } catch (err) {
        console.error("Erreur dashboard:", err);
        setError("Erreur lors du chargement du tableau de bord");
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboard();
  }, [user, authLoading]);

  const userName = user?.first_name || user?.username || "Fisherman";

  const handleCreateReport = () => {
    navigate("/fisherman/reports/new");
  };

  // 🔥 Afficher un loader pendant le chargement
  if (authLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D6B8A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // 🔥 Afficher une erreur si nécessaire
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#5D6B8A] text-white rounded-lg hover:bg-[#4B5673] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          {/* Welcome + CTA */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <p className="text-gray-900 text-2xl font-black">
              Bienvenue à nouveau, {userName} !
            </p>
            <button
              onClick={handleCreateReport}
              className="flex items-center justify-center gap-1 rounded-lg h-10 px-4 bg-[#5D6B8A] text-white text-sm font-bold shadow-md shadow-[#5D6B8A]/20 hover:bg-[#4B5673] transition-all duration-200"
            >
              <span className="material-symbols-outlined text-sm">
                add_circle
              </span>
              <span className="truncate">Créer un nouveau rapport</span>
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center gap-6 sm:gap-12 py-4">
            {stats.map((s) => (
              <div
                key={s.id}
                className="w-32 h-32 relative transform rotate-45"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#5D6B8A] to-[#3A4560] rounded-2xl shadow-md" />
                <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                  <div className="text-center text-white">
                    <p className="text-3xl font-extrabold">{s.value}</p>
                    <p className="text-xs mt-1 font-medium opacity-80">
                      {s.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reports + annonces */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2">
              <h2 className="text-gray-900 text-lg font-bold">
                Vos rapports récents
              </h2>

              {recentReports.length === 0 ? (
                <p className="italic text-slate-500 mt-2">
                  Aucun rapport récent.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {recentReports.map((r) => (
                    <div
                      key={r.id}
                      className="block bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <p className="font-bold text-gray-800 text-sm">
                          {r.id}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside>
              <h2 className="text-gray-900 text-lg font-bold">
                Annonces officielles
              </h2>

              {announcements.length === 0 ? (
                <p className="italic text-slate-500 mt-2">
                  Aucune annonce pour le moment.
                </p>
              ) : (
                <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-4 space-y-4 mt-2">
                  {announcements.map((a, i) => (
                    <div key={i}>
                      <p className="text-xs text-gray-500">{a.date}</p>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {a.title}
                      </h3>
                      <p className="text-xs text-gray-600">{a.text}</p>
                      {i < announcements.length - 1 && (
                        <hr className="my-3 border-gray-200" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}