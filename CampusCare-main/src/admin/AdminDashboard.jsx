import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, AlertTriangle, Users, ChevronRight,
  Calendar, PackageSearch, GraduationCap, BookOpen,
  ShieldCheck, ShieldAlert, ArrowUpRight, Clock, Activity, TrendingUp, Sparkles
} from "lucide-react";
import { fetchComplaints, fetchEmergencies } from "../api";
import { generateAdminOpsBriefing } from "../services/aiAgentService";
import StatusBadge from "../components/StatusBadge";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {
    Promise.all([fetchComplaints(), fetchEmergencies()]).then(([cData, eData]) => {
      setComplaints(cData || []);
      setEmergencies(eData || []);
    });
  }, []);

  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === "Submitted" || c.status === "Pending").length;
  const inProgressComplaints = complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length;
  const unresolvedEmergencies = emergencies.filter(e => e.status !== "Resolved").length;

  const quickActions = [
    { label: "Complaint Manager", desc: "Staff assignment & workflow", icon: FileText, path: "/admin/complaints", count: totalComplaints, badgeBg: "bg-neutral-900 text-white" },
    { label: "Emergency Dispatch", desc: "Real-time incident response", icon: AlertTriangle, path: "/admin/emergencies", count: unresolvedEmergencies, badgeBg: unresolvedEmergencies > 0 ? "bg-rose-600 text-white" : "bg-neutral-100 text-neutral-600" },
    { label: "Events & Clubs", desc: "Approve department events", icon: Calendar, path: "/admin/events" },
    { label: "Lost & Found Claims", desc: "Verify ownership proof", icon: PackageSearch, path: "/admin/lostfound" },
    { label: "Honours & Minors", desc: "Review student applications", icon: GraduationCap, path: "/admin/honours-minors" },
    { label: "Academic Syllabus", desc: "Manage curriculum entries", icon: BookOpen, path: "/admin/syllabus" },
  ];

  return (
    <div className="p-5 md:p-8 lg:p-10 max-w-[1360px] mx-auto space-y-7 animate-in fade-in duration-300">

      {/* ─── Executive Header Banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-neutral-900/10 border border-neutral-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neutral-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/90 border border-neutral-700/80 text-[11px] font-semibold text-neutral-300 backdrop-blur-md">
              <ShieldCheck size={14} className="text-emerald-400" />
              Administrative Command Center • Live Monitoring
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Executive Overview
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 font-normal leading-relaxed">
              Monitor operational campus complaints, manage emergency dispatch, manage syllabus records, and approve degree applications.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/admin/emergencies")}
              className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              <AlertTriangle size={15} /> Emergency Dispatch ({unresolvedEmergencies})
            </button>
          </div>
        </div>
      </div>

      {/* ─── AI Campus Operations Briefing Card ─── */}
      {(() => {
        const briefing = generateAdminOpsBriefing(complaints, emergencies);
        return (
          <div className="bg-gradient-to-r from-indigo-900 via-neutral-900 to-indigo-950 text-white rounded-3xl p-6 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    AI Campus Operations Briefing
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">Proactive Agent</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">Automated daily operational health index & anomaly detection</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full">
                94% Operational Health Index
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1.5 backdrop-blur-md">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">Real-time Summary</span>
                <p className="text-neutral-200 leading-relaxed font-medium">{briefing.summary}</p>
                <div className="text-rose-300 pt-1 font-semibold">{briefing.anomaliesDetected}</div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1.5 backdrop-blur-md">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">AI Action Recommendations</span>
                <ul className="space-y-1 text-neutral-200 font-medium">
                  {briefing.keyRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Key Metrics ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded-full">
              System Wide
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">{totalComplaints}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Total Complaints</p>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Activity size={18} />
            </div>
            <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              Needs Staff
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">{pendingComplaints}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Pending Review</p>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 hover:shadow-xl hover:border-sky-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
              In Workflow
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">{inProgressComplaints}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Assigned / In Progress</p>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 hover:shadow-xl hover:border-rose-200 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert size={18} />
            </div>
            <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
              High Priority
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">{unresolvedEmergencies}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Active Emergencies</p>
        </div>
      </div>

      {/* ─── Operational Control Center Tiles ─── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map(act => {
            const IconC = act.icon;
            return (
              <button
                key={act.label}
                onClick={() => navigate(act.path)}
                className="bg-white border border-neutral-200/80 rounded-2xl p-5 hover:shadow-lg hover:border-neutral-300 transition-all duration-200 text-left flex items-center justify-between group relative"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center shrink-0 group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-200">
                    <IconC size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-900 text-sm group-hover:text-black transition-colors">{act.label}</h3>
                      {act.count !== undefined && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${act.badgeBg || "bg-neutral-100 text-neutral-700"}`}>
                          {act.count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-normal truncate mt-0.5">{act.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-700 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Dispatch Records Table Card ─── */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black tracking-tight">Recent Emergency Dispatch Log</h2>
              <p className="text-[11px] text-neutral-400 font-medium">Critical safety incidents requiring active oversight</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/emergencies")}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black bg-white px-3.5 py-1.5 rounded-xl border border-neutral-200 shadow-2xs hover:shadow-xs transition-all group"
          >
            Dispatch Center <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="divide-y divide-neutral-100">
          {emergencies.slice(0, 4).map(emerg => (
            <div key={emerg.id} className="p-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-neutral-900 text-sm truncate">{emerg.type} Emergency at {emerg.location}</h4>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">{emerg.description || "No further notes attached."}</p>
                </div>
              </div>
              <div className="shrink-0 self-end sm:self-center">
                <StatusBadge status={emerg.status} />
              </div>
            </div>
          ))}
          {emergencies.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-400 font-medium">
              No emergency dispatch records found. Campus operations clear.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
