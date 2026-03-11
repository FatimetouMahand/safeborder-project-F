import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyReports } from "../../services/api";

const STATUS_BADGES = {
  verified: {
    label: "Verified",
    badgeCls: "bg-emerald-500/10 text-emerald-600",
    dotCls: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    badgeCls: "bg-red-500/10 text-red-600",
    dotCls: "bg-red-500",
  },
  submitted: {
    label: "Submitted",
    badgeCls: "bg-amber-500/10 text-amber-600",
    dotCls: "bg-amber-500",
  },
};

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetchMyReports();
        setReports(res.data || []);
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    let ok = true;

    if (statusFilter) {
      ok = ok && r.status === statusFilter;
    }

    if (dateFilter) {
      ok =
        ok &&
        r.created_at &&
        r.created_at.slice(0, 10) === dateFilter;
    }

    return ok;
  });

  return (
    <section className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">
        My Reports
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Status (All)</option>
          <option value="verified">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="submitted">Submitted</option>
        </select>

        <input
          type="date"
          className="rounded-lg border border-slate-300 px-3 py-2 bg-white"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading reports...</p>
      ) : filteredReports.length === 0 ? (
        <p className="text-slate-500 text-sm">
          No reports found.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredReports.map((r) => {
            const badge = STATUS_BADGES[r.status];

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(`${r.id}`)}   // ✅ CORRECTION ICI
                className="text-left bg-white border border-slate-200 rounded-xl p-4 shadow hover:shadow-lg hover:-translate-y-0.5 transition w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-800">
                      {r.reference || r.code || `Report #${r.id}`}
                    </p>

                    {badge && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badge.badgeCls}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${badge.dotCls}`}
                        />
                        {badge.label}
                      </span>
                    )}
                  </div>

                  <span className="text-slate-400 material-symbols-outlined">
                    chevron_right
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  {r.created_at
                    ? r.created_at.slice(0, 10)
                    : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
