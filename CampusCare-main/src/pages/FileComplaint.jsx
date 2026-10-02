import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, AlertTriangle, Upload, X, ShieldAlert, Sparkles, Shield, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { createComplaint, createEmergency } from "../api.js";
import { triageComplaint } from "../services/aiAgentService.js";
import Toast from "../components/Toast.jsx";

const DEPARTMENTS = [
  "Maintenance",
  "Electrical",
  "Plumbing",
  "IT Support",
  "Hostel",
  "Cafeteria",
  "Library",
  "Transport",
  "Security",
  "Academic"
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function FileComplaint() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("complaint");

  const [complaintForm, setComplaintForm] = useState({
    title: "",
    category: "Maintenance",
    priority: "Medium",
    location: "",
    description: "",
    photos: []
  });

  const [emergencyForm, setEmergencyForm] = useState({
    type: "Medical",
    location: "",
    description: "",
    photos: []
  });

  const [loading, setLoading] = useState(false);
  const [aiTriageLoading, setAiTriageLoading] = useState(false);
  const [aiTips, setAiTips] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAITriage = async () => {
    if (!complaintForm.description.trim()) {
      showToast("error", "Please write a brief issue description first for AI Triage.");
      return;
    }

    setAiTriageLoading(true);
    const result = await triageComplaint(complaintForm.description);
    setAiTriageLoading(false);

    setComplaintForm(prev => ({
      ...prev,
      category: result.category,
      priority: result.priority,
      title: prev.title || result.title
    }));

    setAiTips(result.troubleshootingTips || []);
    setAiResult(result);
    showToast("success", result.aiNotice);
  };

  const handlePhotoAdd = (e, targetForm, setTargetForm) => {
    const files = Array.from(e.target.files || []);
    if (targetForm.photos.length + files.length > 4) {
      showToast("error", "Maximum 4 photos allowed.");
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setTargetForm(prev => ({ ...prev, photos: [...prev.photos, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index, setTargetForm) => {
    setTargetForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.title || !complaintForm.location || !complaintForm.description) {
      showToast("error", "Please fill in all required complaint fields.");
      return;
    }

    setLoading(true);
    const created = await createComplaint(complaintForm);
    setLoading(false);

    if (created) {
      showToast("success", "Complaint filed successfully!");
      setTimeout(() => navigate("/complaints"), 1200);
    }
  };

  const handleSubmitEmergency = async (e) => {
    e.preventDefault();
    if (!emergencyForm.location || !emergencyForm.description) {
      showToast("error", "Please specify emergency location and description.");
      return;
    }

    setLoading(true);
    const created = await createEmergency({
      ...emergencyForm,
      time: new Date().toISOString(),
      status: "Reported",
      reportedBy: "user"
    });
    setLoading(false);

    if (created) {
      showToast("error", "EMERGENCY ALERT DISPATCHED TO CAMPUS SECURITY!");
      setTimeout(() => navigate("/complaints"), 1200);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
          {mode === "emergency" ? (
            <AlertTriangle className="w-8 h-8 text-rose-600 animate-pulse" />
          ) : (
            <MessageSquare className="w-8 h-8 text-neutral-900" />
          )}
          Issue & Emergency Reporting
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          File standard department complaints or broadcast immediate campus emergency alerts.
        </p>
      </div>

      {/* Segmented Button Group */}
      <div className="flex bg-neutral-100 p-1.5 rounded-full border border-neutral-200">
        <button
          type="button"
          onClick={() => setMode("complaint")}
          className={`flex-1 py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === "complaint"
              ? "bg-neutral-900 text-white shadow-md shadow-neutral-900/10"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Standard Complaint
        </button>
        <button
          type="button"
          onClick={() => setMode("emergency")}
          className={`flex-1 py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === "emergency"
              ? "bg-rose-600 text-white shadow-md shadow-rose-200"
              : "text-rose-700 hover:bg-rose-100/50"
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Urgent Emergency Alert
        </button>
      </div>

      {/* STANDARD COMPLAINT FORM */}
      {mode === "complaint" ? (
        <form onSubmit={handleSubmitComplaint} className="m3-card p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Complaint Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Broken AC dripping water in Library Silent Study Zone"
              value={complaintForm.title}
              onChange={e => setComplaintForm({ ...complaintForm, title: e.target.value })}
              className="w-full p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Department Category *</label>
              <select
                value={complaintForm.category}
                onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}
                className="w-full p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Priority Level *</label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setComplaintForm({ ...complaintForm, priority: p })}
                    className={`py-2.5 rounded-full text-xs font-bold transition-all ${
                      complaintForm.priority === p
                        ? p === "Urgent" || p === "High"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-neutral-900 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/60"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Specific Campus Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. Block C, 3rd Floor Washroom / Hostel B Room 204"
              value={complaintForm.location}
              onChange={e => setComplaintForm({ ...complaintForm, location: e.target.value })}
              className="w-full p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">Detailed Issue Description *</label>
              <button
                type="button"
                onClick={handleAITriage}
                disabled={aiTriageLoading}
                className="m3-ai-button"
              >
                <Sparkles className={`w-3.5 h-3.5 ${aiTriageLoading ? "animate-spin text-purple-200" : "animate-pulse"}`} />
                {aiTriageLoading ? "AI Analyzing..." : "AI Auto-Triage & Categorize"}
              </button>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Describe the issue, severity, and any hazards..."
              value={complaintForm.description}
              onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
              className="w-full p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white"
            />
          </div>

          {/* NEXT-LEVEL AI TRIAGE RESULT DASHBOARD */}
          {aiResult && (
            <div className="p-5 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white rounded-3xl border border-purple-500/30 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-2">
                      AI Triage Intelligence Analysis
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {aiResult.confidence || 96}% AI Match
                      </span>
                    </h4>
                    <p className="text-[11px] text-purple-200/80">NLP engine classified department, priority & estimated resolution</p>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => setAiResult(null)} 
                  className="text-purple-300 hover:text-white text-xs font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-colors"
                >
                  Dismiss
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider block mb-1">Detected Dept</span>
                  <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    {aiResult.category}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider block mb-1">Calculated Priority</span>
                  <span className={`text-sm font-extrabold flex items-center gap-1.5 ${
                    aiResult.priority === 'Urgent' || aiResult.priority === 'High' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    {aiResult.priority}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider block mb-1">Urgency Index</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-amber-300">{aiResult.urgencyScore || 7}/10</span>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (aiResult.urgencyScore || 7) >= 8 ? 'bg-rose-500' : (aiResult.urgencyScore || 7) >= 5 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${((aiResult.urgencyScore || 7) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider block mb-1">Est. Resolution</span>
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-300" />
                    {aiResult.estimatedResolution || 'Within 6 Hours'}
                  </span>
                </div>
              </div>

              {/* Self-Service Troubleshooting Section */}
              {aiResult.troubleshootingTips?.length > 0 && (
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Quick Self-Service Checklist
                    </span>
                    <span className="text-[10px] text-purple-300 font-normal">Try these before submitting</span>
                  </div>
                  <div className="space-y-1.5">
                    {aiResult.troubleshootingTips.map((tip, idx) => (
                      <label key={idx} className="flex items-start gap-2 text-xs text-purple-100/90 font-medium cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" className="mt-0.5 rounded border-white/30 text-purple-600 focus:ring-purple-500" />
                        <span>{tip}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Escalation Alert */}
              {aiResult.isEmergencyCandidate && (
                <div className="bg-rose-500/20 border border-rose-500/40 p-3 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                    <div>
                      <p className="text-xs font-bold text-rose-200">Active Safety Hazard Detected!</p>
                      <p className="text-[11px] text-rose-100/80">Issue contains critical hazard keywords. Switch to Emergency Alert?</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("emergency")}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-extrabold shadow-md shrink-0 transition-colors"
                  >
                    Broadcast Alert
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Photos */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">Photo Attachments (Max 4)</label>
            <div className="flex items-center gap-3 flex-wrap">
              {complaintForm.photos.map((img, idx) => (
                <div key={idx} className="w-20 h-20 bg-neutral-100 rounded-2xl overflow-hidden relative group border border-neutral-200">
                  <img src={img} alt="attachment" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx, setComplaintForm)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {complaintForm.photos.length < 4 && (
                <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 flex flex-col items-center justify-center cursor-pointer text-neutral-400 hover:text-neutral-900 transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handlePhotoAdd(e, complaintForm, setComplaintForm)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/complaints")}
              className="m3-button-tonal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="m3-button-filled"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      ) : (
        /* EMERGENCY ALERT FORM */
        <form onSubmit={handleSubmitEmergency} className="m3-card border-2 border-rose-300 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-semibold leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>Emergency alerts notify campus security and quick response teams immediately. For immediate life-threatening situations, call emergency services (911/112) first.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Emergency Type *</label>
              <select
                value={emergencyForm.type}
                onChange={e => setEmergencyForm({ ...emergencyForm, type: e.target.value })}
                className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="Medical">Medical Emergency</option>
                <option value="Security">Security Incident / Tailgating</option>
                <option value="Fire">Fire / Chemical Hazard</option>
                <option value="Other">Other Urgent Situation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Exact Campus Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Football Ground / Chemistry Lab 2"
                value={emergencyForm.location}
                onChange={e => setEmergencyForm({ ...emergencyForm, location: e.target.value })}
                className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Brief Incident Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe the urgent situation quickly..."
              value={emergencyForm.description}
              onChange={e => setEmergencyForm({ ...emergencyForm, description: e.target.value })}
              className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Emergency Photo Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Photo Proof (Optional, only if safe)</label>
            <div className="flex items-center gap-3 flex-wrap">
              {emergencyForm.photos.map((img, idx) => (
                <div key={idx} className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden relative group border border-slate-200">
                  <img src={img} alt="emergency attachment" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx, setEmergencyForm)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {emergencyForm.photos.length < 3 && (
                <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 flex flex-col items-center justify-center cursor-pointer text-rose-600 hover:bg-rose-100 transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handlePhotoAdd(e, emergencyForm, setEmergencyForm)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="m3-button-tonal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> {loading ? "Broadcasting..." : "Broadcast Emergency Alert"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
