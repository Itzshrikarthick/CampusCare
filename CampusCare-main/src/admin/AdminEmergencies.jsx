import { useState, useEffect } from "react";
import { AlertTriangle, ImageIcon, MapPin, Clock, Check, PenTool, Flame, Trash2 } from "lucide-react";
import { fetchEmergencies, updateEmergencyStatus, clearAllEmergencies } from "../api";

function formatTimeAgo(dateStr) {
  if (!dateStr) return "Just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  if (mins < 60) return `${mins || 1} mins ago`;
  if (hrs < 24) return `${hrs} hrs ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function AdminEmergencies() {
  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {
    fetchEmergencies().then(data => setEmergencies(data));
  }, []);

  const updateStatus = async (id, newStatus) => {
    await updateEmergencyStatus(id, newStatus);
    setEmergencies((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
  };

  const handleClearHistory = async () => {
    if (window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete ALL reported emergencies from the database? This action cannot be undone.")) {
      await clearAllEmergencies();
      setEmergencies([]);
    }
  };

  const reportedByUsers = emergencies.filter((e) => e.reportedBy === "user");

  const reportedCount = reportedByUsers.filter(e => e.status === "Reported" || !e.status).length;
  const inProgressCount = reportedByUsers.filter(e => e.status === "In Progress").length;
  const resolvedCount = reportedByUsers.filter(e => e.status === "Resolved").length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 animate-pulse" /> Emergency Operations Dispatch
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor and respond to critical incidents reported by students.
          </p>
        </div>

        {reportedByUsers.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-bold transition-all flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span>Clear Incident Database</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="relative w-14 h-14 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            {reportedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            )}
            <AlertTriangle size={24} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Alerts</p>
            <p className="text-3xl font-bold text-black tracking-tight">{reportedCount}</p>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Flame size={24} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Responding</p>
            <p className="text-3xl font-bold text-black tracking-tight">{inProgressCount}</p>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Check size={24} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Secured</p>
            <p className="text-3xl font-bold text-black tracking-tight">{resolvedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 sm:px-8 py-5 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black tracking-tight">Active Incident Log</h2>
          <span className="text-xs font-semibold text-neutral-500 bg-white px-3 py-1 rounded-full border border-neutral-200 shadow-sm">
            {reportedByUsers.length} Recorded
          </span>
        </div>

        <div className="divide-y divide-neutral-100">
          {reportedByUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Campus Secure</h3>
              <p className="text-neutral-500 font-medium max-w-sm mx-auto">
                No emergencies are currently reported. The campus is safe.
              </p>
            </div>
          ) : (
            reportedByUsers.map(
              ({ id, type, location, description, status = "Reported", time, photos = [] }) => {
                const isSecured = status === "Resolved";

                return (
                  <div key={id} className={`p-6 sm:p-8 transition-colors ${isSecured ? 'bg-neutral-50/50 opacity-75' : 'hover:bg-neutral-50/30'} ${status === 'Reported' ? 'bg-rose-50/10' : ''}`}>
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Content Column */}
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-6">
                        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 shadow-sm border ${status === "Reported" ? "bg-rose-100 text-rose-600 border-rose-200" :
                            status === "In Progress" ? "bg-blue-100 text-blue-600 border-blue-200" :
                              "bg-neutral-100 text-black border-neutral-200/60"
                          }`}>
                          <AlertTriangle size={24} strokeWidth={2} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-black tracking-tight leading-tight">{type} Emergency</h3>
                            <span
                              className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase shrink-0 shadow-sm ${status === "Reported"
                                  ? "bg-rose-100 text-rose-800 border border-rose-200 animate-pulse"
                                  : status === "In Progress"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : "bg-green-100 text-green-800 border border-green-200"
                                }`}
                            >
                              {status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-sm font-bold text-neutral-800 flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200/60">
                              <MapPin size={14} className="text-rose-500" />
                              {location}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:block" />
                            <span className="text-xs sm:text-sm font-medium text-neutral-500 flex items-center gap-1.5">
                              <Clock size={14} />
                              {formatTimeAgo(time)}
                            </span>
                          </div>

                          {description && (
                            <div className="mt-5 p-4 bg-white rounded-xl border border-rose-100/50 shadow-sm">
                              <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line font-medium wrap-break-word">
                                {description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Side Actions Column */}
                      <div className="lg:w-72 shrink-0 flex flex-col gap-6 lg:border-l lg:border-neutral-100 lg:pl-8">
                        {/* Status Manager */}
                        <div className="space-y-3">
                          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">
                            Dispatch Status
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {status === "Reported" && (
                              <button
                                onClick={() => updateStatus(id, "In Progress")}
                                className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-bold rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
                              >
                                <PenTool size={16} />
                                Dispatch Unit (In Progress)
                              </button>
                            )}
                            {status === "In Progress" && (
                              <button
                                onClick={() => updateStatus(id, "Resolved")}
                                className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-bold rounded-xl border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors shadow-sm"
                              >
                                <Check size={16} />
                                Scene Secured (Resolved)
                              </button>
                            )}
                            {status === "Resolved" && (
                              <button
                                onClick={() => updateStatus(id, "In Progress")}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm"
                              >
                                Reopen Incident Log
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Photos */}
                        {photos.length > 0 && (
                          <div className="space-y-3 pt-6 border-t border-neutral-100">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">
                              Scene Photos ({photos.length})
                            </span>
                            <div className="flex gap-2 flex-wrap">
                              {photos.map((src, i) => (
                                <a key={i} href={src} target="_blank" rel="noreferrer" className="block relative group">
                                  <img
                                    src={src}
                                    alt={`Proof ${i + 1}`}
                                    className="w-[72px] h-[72px] object-cover rounded-xl border border-neutral-200 shadow-sm group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ImageIcon size={16} className="text-white" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminEmergencies;

