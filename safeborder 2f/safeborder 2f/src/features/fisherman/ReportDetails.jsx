import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchReportById, uploadMedia, addMediaToReport } from "../../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_BADGE_CLASSES = {
  verified: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
  pending: "bg-amber-500/10 text-amber-600",
};

const STATUS_DOT_CLASSES = {
  verified: "bg-emerald-500",
  rejected: "bg-red-500",
  pending: "bg-amber-500",
};

export default function ReportDetails() {
  const { id } = useParams();
  const [tab, setTab] = useState("overview");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const loadReport = async () => {
    try {
      const res = await fetchReportById(id);
      setReport(res.data);
    } catch (err) {
      console.error("Erreur de chargement :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [id]);

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError("");
    try {
      const mediaType = file.type.startsWith("video/") ? "video" : "image";
      const uploadRes = await uploadMedia({ mediaType, file });
      const mediaId = uploadRes?.data?.id;
      if (!mediaId) throw new Error("ID média manquant");
      await addMediaToReport(id, mediaId);
      await loadReport();
    } catch (err) {
      setUploadError(err.response?.data?.detail || "Erreur lors de l’upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) return <section className="max-w-5xl mx-auto p-4"><p>Chargement...</p></section>;
  if (!report) return <section className="max-w-5xl mx-auto p-4"><p>Rapport non trouvé.</p></section>;

  const badgeClasses = STATUS_BADGE_CLASSES[report.status] || "bg-slate-200 text-slate-700";
  const dotClasses = STATUS_DOT_CLASSES[report.status] || "bg-slate-400";
  const mediaItems = report.media || [];

  return (
    <section className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">{report.title || `Rapport #${id}`}</h1>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badgeClasses}`}>
          <span className={`size-1.5 rounded-full ${dotClasses}`} />
          {report.status}
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        {["overview", "media"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              tab === t
                ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {t === "overview" ? "Aperçu" : "Médias"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div><h3 className="font-semibold">Description</h3><p className="text-sm text-slate-600">{report.description || "Aucune description."}</p></div>
            <div>
              <h3 className="font-semibold">Coordonnées</h3>
              <p className="text-sm text-slate-600">
                {report.location_lat !== null && report.location_lng !== null
                  ? `Lat: ${report.location_lat}, Lng: ${report.location_lng}`
                  : "Non fournies."}
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            {report.location_lat !== null && report.location_lng !== null ? (
  <MapContainer
    center={[report.location_lat, report.location_lng]}
    zoom={8}
    className="aspect-video rounded-lg"
  >
    <TileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[report.location_lat, report.location_lng]}>
      <Popup>
        {report.title || `Rapport #${id}`}
      </Popup>
    </Marker>
  </MapContainer>
) : (
  <div className="aspect-video rounded-lg bg-slate-100 grid place-items-center text-slate-400">
    Coordonnées non disponibles
  </div>
)}
          </div>
        </div>
      )}

      {tab === "media" && (
        <>
          <div className="mb-4">
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer text-sm font-semibold hover:bg-slate-50">
              <span>📤</span>
              {uploading ? "Envoi..." : "Ajouter un média"}
              <input type="file" className="hidden" onChange={handleMediaUpload} disabled={uploading} accept="image/*,video/*" />
            </label>
            {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
          </div>

          {mediaItems.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun média n’est associé à ce rapport.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaItems.map((m) => (
                <div key={m.id} className="bg-white border rounded-xl overflow-hidden">
                  {m.media_type === "image" ? (
                    <img src={m.file_url} alt="Média" className="w-full h-48 object-cover" />
                  ) : (
                    <video src={m.file_url} controls className="w-full h-48 object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}