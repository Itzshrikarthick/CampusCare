import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, AlertTriangle, PenLine, Clock, ChevronRight,
  Calendar, Package, GraduationCap, BookOpen,
  ArrowUpRight, TrendingUp, Activity, Bell, ShieldCheck,
  Sparkles, PlusCircle, MapPin, Coffee, CheckCircle2, AlertCircle,
  Radio, Zap
} from "lucide-react";
import { fetchComplaints, fetchEmergencies, fetchCafeteria, fetchEvents } from "../api";

function formatTimeAgo(dateStr) {
  if (!dateStr) return "Just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  if (mins < 60) return `${mins || 1}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function Dashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchComplaints(), 
      fetchEmergencies(),
      fetchCafeteria(),
      fetchEvents()
    ]).then(([c, e, cafe, ev]) => {
      setComplaints(c || []);
      setEmergencies(e || []);
      setCafeterias(cafe || []);
      setUpcomingEvents((ev || []).slice(0, 2));
    });
  }, []);

  const pending = complaints.filter(c => c.status === "Pending" || c.status === "Submitted").length;
  const inProgress = complaints.filter(c => c.status === "In Progress" || c.status === "Assigned" || c.status === "Under Review").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const sosCount = emergencies.filter(e => e.reportedBy === "user").length;
  const recentComplaints = complaints.slice(0, 5);

  const statusBadgeStyle = (s) => {
    const st = (s || "").toLowerCase();
    if (st === "resolved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (st === "in progress" || st === "assigned" || st === "under review") return "bg-sky-50 text-sky-700 border-sky-200";
    if (st === "rejected" || st === "closed") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-amber-50 text-amber-800 border-amber-200";
  };

  const priorityBadge = (p) => {
    const pr = (p || "").toLowerCase();
    if (pr === "urgent" || pr === "high") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          Urgent
        </span>
      );
    }
    if (pr === "medium") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
        Normal
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-300">

      {/* ─── Simple & Attractive Header ─── */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Campus Network
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              {getGreeting()}, <span className="text-neutral-600 font-bold">Student</span> 👋
            </h1>

            <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
              Manage your support complaints, check mess crowd status, access course guides, and dispatch emergency alerts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => navigate("/file-complaint")}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              <PenLine size={15} /> File New Complaint
            </button>
            <button
              onClick={() => navigate("/file-complaint")}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200/80 transition-all active:scale-[0.98]"
            >
              <AlertTriangle size={15} /> SOS Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* ─── Metric Cards Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Pending Card */}
        <div 
          onClick={() => navigate("/complaints")} 
          className="group bg-white border border-neutral-200/80 rounded-2xl p-5 hover:shadow-md hover:border-amber-200/90 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bell size={19} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                  <Clock size={10} /> Queue
                </span>
                <ArrowUpRight size={15} className="text-neutral-300 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">{pending}</p>
              <p className="text-xs font-semibold text-neutral-500 mt-1">Pending Complaints</p>
            </div>
          </div>
          {/* Micro Progress Indicator */}
          <div className="mt-4 w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: pending > 0 ? `${Math.min(pending * 25, 100)}%` : '10%' }} />
          </div>
        </div>

        {/* In Progress Card */}
        <div 
          onClick={() => navigate("/complaints")} 
          className="group bg-white border border-neutral-200/80 rounded-2xl p-5 hover:shadow-md hover:border-sky-200/90 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity size={19} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                  <Activity size={10} /> Active
                </span>
                <ArrowUpRight size={15} className="text-neutral-300 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">{inProgress}</p>
              <p className="text-xs font-semibold text-neutral-500 mt-1">In Progress</p>
            </div>
          </div>
          {/* Micro Progress Indicator */}
          <div className="mt-4 w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: inProgress > 0 ? `${Math.min(inProgress * 30, 100)}%` : '10%' }} />
          </div>
        </div>

        {/* Resolved Card */}
        <div 
          onClick={() => navigate("/complaints")} 
          className="group bg-white border border-neutral-200/80 rounded-2xl p-5 hover:shadow-md hover:border-emerald-200/90 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle2 size={19} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <TrendingUp size={10} /> Done
                </span>
                <ArrowUpRight size={15} className="text-neutral-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">{resolved}</p>
              <p className="text-xs font-semibold text-neutral-500 mt-1">Resolved Issues</p>
            </div>
          </div>
          {/* Micro Progress Indicator */}
          <div className="mt-4 w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: resolved > 0 ? '100%' : '10%' }} />
          </div>
        </div>

        {/* SOS Card */}
        <div 
          onClick={() => navigate("/file-complaint")} 
          className="group bg-white border border-neutral-200/80 rounded-2xl p-5 hover:shadow-md hover:border-rose-200/90 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle size={19} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> Urgent
                </span>
                <ArrowUpRight size={15} className="text-neutral-300 group-hover:text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">{sosCount}</p>
              <p className="text-xs font-semibold text-neutral-500 mt-1">SOS Incident Logs</p>
            </div>
          </div>
          {/* Micro Progress Indicator */}
          <div className="mt-4 w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: sosCount > 0 ? `${Math.min(sosCount * 50, 100)}%` : '5%' }} />
          </div>
        </div>
      </div>

      {/* ─── Services Grid ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Campus Portals & Portlets</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            { label: "Events & Clubs", desc: "Clubs & hackathons", icon: Calendar, path: "/events", tag: "Active" },
            { label: "Lost & Found", desc: "Report & claim items", icon: Package, path: "/lostfound", tag: "Claims" },
            { label: "Honours & Minors", desc: "Degree specialization", icon: GraduationCap, path: "/honours-minors", tag: "Academic" },
            { label: "Syllabus Guide", desc: "Course units & books", icon: BookOpen, path: "/syllabus", tag: "R2023" },
            { label: "My Complaints", desc: "View status history", icon: FileText, path: "/complaints", tag: "Support" },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="group bg-white border border-neutral-200/90 rounded-2xl p-4 text-left hover:shadow-lg hover:border-neutral-400 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center group-hover:bg-neutral-950 group-hover:text-white transition-colors">
                  <item.icon size={19} />
                </div>
                <span className="text-[9px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                  {item.tag}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900 group-hover:text-black transition-colors">{item.label}</p>
                <p className="text-[11px] text-neutral-400 font-normal mt-0.5">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Content Split: Left (Recent Activity) + Right (Campus Live Status) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Complaints Feed (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-neutral-200/90 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-sm">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-neutral-900 tracking-tight">Recent Support Activity</h2>
                  <p className="text-[11px] text-neutral-400 font-medium">Your filed issues & status updates</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/complaints")}
                className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-700 hover:text-black bg-white px-3.5 py-1.5 rounded-xl border border-neutral-200 shadow-2xs hover:shadow-xs transition-all group"
              >
                View All <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {recentComplaints.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto text-neutral-400">
                  <ShieldCheck size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-neutral-900">No active complaints</p>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">Everything is running smoothly! If you encounter an operational issue, report it right away.</p>
                </div>
                <button
                  onClick={() => navigate("/file-complaint")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  <PlusCircle size={15} /> File First Report
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentComplaints.map(({ id, title, category, status, priority, createdAt, location }) => (
                  <div
                    key={id}
                    onClick={() => navigate("/complaints")}
                    className="p-5 px-6 hover:bg-neutral-50/80 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {priorityBadge(priority)}
                        <span className="text-xs font-bold text-neutral-900 truncate group-hover:text-black transition-colors">{title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium flex-wrap">
                        <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-bold">{category}</span>
                        {location && (
                          <>
                            <span className="text-neutral-300">•</span>
                            <span className="text-neutral-500 flex items-center gap-1"><MapPin size={11} /> {location}</span>
                          </>
                        )}
                        <span className="text-neutral-300">•</span>
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Clock size={11} /> {formatTimeAgo(createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusBadgeStyle(status)}`}>
                        {status || "Submitted"}
                      </span>
                      <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-700 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Campus Real-Time Widgets (1 Col) */}
        <div className="space-y-5">
          {/* Cafeteria Status Widget */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center">
                  <Coffee size={16} />
                </div>
                <h3 className="text-sm font-black text-neutral-900 tracking-tight">Mess Crowd Status</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Data
              </span>
            </div>

            <div className="space-y-3">
              {cafeterias.slice(0, 2).map(cafe => (
                <div key={cafe.id} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{cafe.name}</p>
                    <p className="text-[10px] text-neutral-400 font-medium">Daily Dining Mess</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                    cafe.crowdStatus === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    cafe.crowdStatus === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {cafe.crowdStatus || 'Medium'} Crowd
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Club Event Teaser Widget */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-sm font-black text-neutral-900 tracking-tight">Upcoming Events</h3>
              </div>
              <button onClick={() => navigate("/events")} className="text-[11px] font-extrabold text-neutral-500 hover:text-black">
                Explore
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No events scheduled today.</p>
              ) : (
                upcomingEvents.map(ev => (
                  <div key={ev.id} onClick={() => navigate("/events")} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/60 hover:bg-neutral-100/80 transition-colors cursor-pointer space-y-1">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-neutral-900 text-white rounded-md">
                      {ev.department} Dept
                    </span>
                    <p className="text-xs font-bold text-neutral-900 pt-1">{ev.title}</p>
                    <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Calendar size={11} /> {ev.date}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
