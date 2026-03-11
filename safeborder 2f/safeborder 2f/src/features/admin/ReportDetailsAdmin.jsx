import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/api";

const STATUS_BADGE = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  verified: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const ReportDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`fisherman-reports/${id}/`);
        setReport(res.data);
        setAdminNotes(res.data.admin_notes || "");
      } catch (err) {
        setError("Report not found");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleConfirm = async () => {
    if (!window.confirm(`Confirm ${confirmAction.toUpperCase()} this report?`)) {
      setConfirmAction(null);
      return;
    }

    try {
      setActionLoading(true);
      
      await axios.patch(`fisherman-reports/${id}/`, {
        status: confirmAction,
        admin_notes: adminNotes,
      });

      navigate("/admin/reports", { state: { refresh: true } });
    } catch (err) {
      alert("Failed to update report");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const isLocked = report && ["verified", "resolved", "rejected"].includes(report.status);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-primary hover:underline mb-6"
        >
          ← Back to reports
        </button>

        <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          {/* HEADER */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#0d141b] dark:text-white">
                  {report.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[report.status]}`}>
                  {report.status.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                By {report.fisherman_username} • {new Date(report.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h3 className="font-semibold mb-2 text-[#0d141b] dark:text-white">Description</h3>
            <p className="text-slate-700 dark:text-slate-300">
              {report.description || "—"}
            </p>
          </div>

          {/* LOCATION */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h3 className="font-semibold mb-2 text-[#0d141b] dark:text-white">Location</h3>
            <p className="font-mono text-sm">
              {report.location_lat && report.location_lng
                ? `${report.location_lat}, ${report.location_lng}`
                : "—"}
            </p>
          </div>

          {/* THREAT TYPE */}
          {report.threat_type_name && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="font-semibold mb-2 text-[#0d141b] dark:text-white">Hazard Type</h3>
              <span className="px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-800">
                {report.threat_type_name}
              </span>
            </div>
          )}

          {/* MEDIA */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h3 className="font-semibold mb-3 text-[#0d141b] dark:text-white">Media</h3>
            {report.media_files_count === 0 ? (
              <p className="text-slate-400">No media attached</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {report.media.map((m) =>
                  m.media_type === "image" ? (
                    <img
                      key={m.id}
                      src={m.file_url}
                      alt=""
                      className="rounded border w-full h-48 object-cover"
                    />
                  ) : (
                    <video
                      key={m.id}
                      src={m.file_url}
                      controls
                      className="rounded border w-full"
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* ADMIN NOTES */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <label className="block font-semibold mb-2 text-[#0d141b] dark:text-white">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full h-28 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              placeholder="Explain your decision..."
              disabled={isLocked}
            />
          </div>

          {/* ACTIONS BUTTONS - Verify button with white background */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-sm font-semibold"
            >
              Back
            </button>

            <button
              onClick={() => setConfirmAction("rejected")}
              disabled={isLocked || actionLoading}
              className="flex-1 h-11 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold disabled:opacity-50"
            >
              Reject
            </button>

            {/* Verify button with white background */}
            <button
              onClick={() => setConfirmAction("verified")}
              disabled={isLocked || actionLoading}
              className="flex-1 h-11 rounded-lg bg-white text-primary border border-primary hover:bg-blue-50 font-bold disabled:opacity-50"
            >
              Verify
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMATION */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">
              Confirm {confirmAction === "verified" ? "Verification" : "Rejection"}
            </h3>

            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to {confirmAction} this report?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border rounded text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded text-sm font-semibold ${
                  confirmAction === "verified" ? "bg-green-600" : "bg-red-500"
                }`}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailsAdmin;