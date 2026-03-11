import React, { useEffect, useState } from "react";
import { fetchMediaList, uploadMedia } from "../../services/api";

export default function MediaGallery() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function loadMedia() {
    try {
      const res = await fetchMediaList();
      setMediaItems(res.data || []);
    } catch (err) {
      console.error("Error loading media:", err);
      setError("Erreur lors du chargement des médias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      await uploadMedia(null, "image", file);
      await loadMedia(); // refresh
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.detail ||
          "Erreur lors de l'upload du média."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200">

            {/* Search + Upload Bar */}
            <div className="flex flex-wrap justify-between items-center gap-3 px-4 py-3 border-b border-gray-200">
              <div className="relative w-full max-w-xs">
                <input
                  className="block w-full rounded border border-gray-300 bg-gray-50 py-1.5 pl-8 pr-3 text-gray-900 text-sm placeholder:text-gray-500"
                  placeholder="Rechercher un média..."
                  type="text"
                />
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-base">
                  search
                </span>
              </div>

              <label className="flex items-center justify-center rounded h-8 bg-[#5D6B8A] text-white gap-1 text-xs font-bold px-3 hover:bg-[#4B5673] cursor-pointer">
                <span className="material-symbols-outlined text-sm">
                  upload
                </span>
                {uploading ? "Upload..." : "Télécharger un média"}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Media Grid */}
            <div className="p-4">
              {loading ? (
                <p className="text-sm text-gray-500">Chargement...</p>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : mediaItems.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Aucun média disponible pour le moment.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex flex-col gap-2 rounded-lg bg-gray-50 p-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
                    >
                      <div
                        className="relative w-full aspect-video rounded bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${item.file}")`,
                        }}
                      />
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {item.label || item.name || "Media"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.created_at || ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
