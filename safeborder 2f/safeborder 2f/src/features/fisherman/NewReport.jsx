import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createReport, uploadMedia, addMediaToReport } from "../../services/api";

export default function NewReport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    latitude: "",
    longitude: "",
    threatType: "",
    severity: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenFilePicker = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const type = file.type.startsWith("video/") ? "video" : "image";
    setMediaType(type);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location_lat: form.latitude ? parseFloat(form.latitude) : null,
        location_lng: form.longitude ? parseFloat(form.longitude) : null,
        threat_type: form.threatType ? parseInt(form.threatType, 10) : null,
        risk_level: form.severity || "low",
      };

      const reportRes = await createReport(payload);
      const reportData = reportRes?.data;

      if (!reportData?.id) {
        throw new Error("Le serveur n’a pas renvoyé l’identifiant du rapport.");
      }

      const reportId = reportData.id;

      if (selectedFile) {
        const uploadRes = await uploadMedia({ mediaType, file: selectedFile });
        const mediaId = uploadRes?.data?.id;
        if (!mediaId) throw new Error("Échec de l’upload du média.");
        await addMediaToReport(reportId, mediaId);
      }

      setSuccess("Rapport soumis avec succès !");
      setTimeout(() => navigate(`/fisherman/reports/${reportId}`), 1000);
    } catch (err) {
      console.error("Erreur :", err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Une erreur est survenue lors de l’envoi du rapport."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Créer un nouveau rapport</h1>
      <div className="grid lg:grid-cols-2 gap-4">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Titre" className="w-full rounded border px-3 py-1.5 text-sm" required />
          <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Description" className="w-full rounded border px-3 py-1.5 text-sm" required />
          <div className="grid grid-cols-2 gap-2">
            <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} placeholder="Latitude" className="rounded border px-3 py-1.5 text-sm" />
            <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} placeholder="Longitude" className="rounded border px-3 py-1.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select name="threatType" value={form.threatType} onChange={handleChange} className="rounded border px-3 py-1.5 text-sm">
              <option value="">Type de menace</option>
              <option value="1">Pêche illégale</option>
              <option value="2">Détresse</option>
              <option value="3">Pollution</option>
            </select>
            <select name="severity" value={form.severity} onChange={handleChange} className="rounded border px-3 py-1.5 text-sm">
              <option value="">Sévérité</option>
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}
          <button type="submit" disabled={loading} className="bg-[#5D6B8A] text-white px-4 py-1.5 rounded text-sm w-full">
            {loading ? "Envoi..." : "Soumettre"}
          </button>
        </form>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="aspect-video rounded bg-gray-100 flex items-center justify-center overflow-hidden">
            {!previewURL ? (
              <span className="text-gray-400 text-sm">Aperçu du média</span>
            ) : mediaType === "image" ? (
              <img src={previewURL} alt="preview" className="w-full h-full object-contain" />
            ) : (
              <video src={previewURL} controls className="w-full h-full object-contain" />
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={handleOpenFilePicker} className="mt-3 w-full rounded border px-3 py-1.5 text-sm">
            Télécharger un média
          </button>
          {selectedFile && <p className="mt-2 text-xs text-green-600 truncate">{selectedFile.name}</p>}
        </div>
      </div>
    </section>
  );
}