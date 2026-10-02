import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  Search,
  Star,
  RotateCcw,
  Send,
  Sparkles
} from "lucide-react";
import {
  fetchComplaints,
  addComplaintComment,
  rateComplaintResolution,
  reopenComplaint
} from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Toast from "../components/Toast.jsx";
import Modal from "../components/Modal.jsx";

const DEPARTMENTS = [
  "All",
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

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [reopenReason, setReopenReason] = useState("");

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchComplaints().then((data) => {
      if (isMounted) {
        setComplaints(data || []);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment || !selectedComplaint) return;
    const updated = await addComplaintComment(selectedComplaint.id, newComment, "Student");
    if (updated) {
      setComplaints(complaints.map(c => (c.id === selectedComplaint.id ? updated : c)));
      setSelectedComplaint(updated);
      setNewComment("");
      showToast("success", "Comment added to timeline.");
    }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    const updated = await rateComplaintResolution(selectedComplaint.id, ratingVal, ratingFeedback);
    if (updated) {
      setComplaints(complaints.map(c => (c.id === selectedComplaint.id ? updated : c)));
      setSelectedComplaint(updated);
      setIsRatingModalOpen(false);
      showToast("success", "Rating & feedback submitted!");
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !reopenReason) return;
    const updated = await reopenComplaint(selectedComplaint.id, reopenReason);
    if (updated) {
      setComplaints(complaints.map(c => (c.id === selectedComplaint.id ? updated : c)));
      setSelectedComplaint(updated);
      setIsReopenModalOpen(false);
      setReopenReason("");
      showToast("info", "Complaint has been reopened for admin review.");
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesDept = deptFilter === "All" || c.category === deptFilter;
    const matchesSearch =
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDept && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          My Complaints & Active Cases
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor complaint progress, chat with assigned staff leads, rate completed work, or reopen unresolved cases.
        </p>
      </div>

      {/* M3 Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 m3-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full m3-search-bar"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Dept:</span>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="w-full p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Loading complaints...</div>
      ) : filteredComplaints.length === 0 ? (
        <div className="py-16 text-center m3-card p-8 space-y-2">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Complaints Found</h3>
          <p className="text-sm text-slate-400">Clear filters or file a new complaint.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map(comp => (
            <div
              key={comp.id}
              className="m3-card-interactive p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {comp.category}
                  </span>
                  <StatusBadge status={comp.status} />
                </div>

                <h3 className="font-bold text-neutral-900 text-lg line-clamp-1">{comp.title}</h3>
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{comp.description}</p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedComplaint(comp)}
                  className="m3-button-tonal w-full text-xs py-2"
                >
                  Timeline ({comp.timeline?.length || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TIMELINE & DISCUSSION MODAL */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint Case — ${selectedComplaint.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-400 block mb-0.5 font-medium">Department</span>
                <span className="font-bold text-neutral-900">{selectedComplaint.category}</span>
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5 font-medium">Current Status</span>
                <StatusBadge status={selectedComplaint.status} />
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5 font-medium">Assigned Staff</span>
                <span className="font-bold text-neutral-900">{selectedComplaint.assignedTo || "Unassigned"}</span>
              </div>
              <div>
                <span className="text-neutral-400 block mb-0.5 font-medium">Est. ETA</span>
                <span className="font-bold text-neutral-900">
                  {selectedComplaint.eta ? new Date(selectedComplaint.eta).toLocaleDateString() : "Pending"}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Resolution Timeline Logs</h4>
              <div className="space-y-3 pl-3 border-l-2 border-neutral-300">
                {(selectedComplaint.timeline || []).map(t => (
                  <div key={t.id} className="relative pl-4 space-y-1">
                    <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-neutral-900 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900">{t.author} ({t.status})</span>
                      <span className="text-neutral-400 text-[10px]">{new Date(t.date).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">{t.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a message to the resolution thread..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              />
              <button
                type="submit"
                className="m3-button-filled text-xs py-2.5 px-4"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {selectedComplaint.status === "Resolved" || selectedComplaint.status === "Closed" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRatingModalOpen(true)}
                    className="px-4 py-2 bg-amber-100 text-amber-950 hover:bg-amber-200 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Rate Resolution
                  </button>
                  <button
                    onClick={() => setIsReopenModalOpen(true)}
                    className="px-4 py-2 bg-rose-100 text-rose-950 hover:bg-rose-200 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Reopen Issue
                  </button>
                </div>
              ) : null}

              <button
                onClick={() => setSelectedComplaint(null)}
                className="m3-button-tonal ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* RATING MODAL */}
      {isRatingModalOpen && selectedComplaint && (
        <Modal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          title="Rate Resolution Quality"
        >
          <form onSubmit={handleRate} className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500">Select star rating for work completed by campus staff:</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingVal(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= ratingVal
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Comments</label>
              <textarea
                rows={3}
                placeholder="Optional feedback for the department head..."
                value={ratingFeedback}
                onChange={e => setRatingFeedback(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRatingModalOpen(false)}
                className="m3-button-tonal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="m3-button-filled"
              >
                Submit Rating
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* REOPEN MODAL */}
      {isReopenModalOpen && selectedComplaint && (
        <Modal
          isOpen={isReopenModalOpen}
          onClose={() => setIsReopenModalOpen(false)}
          title="Reopen Unresolved Complaint"
        >
          <form onSubmit={handleReopen} className="space-y-4">
            <div className="p-3 bg-rose-50 rounded-2xl text-xs text-rose-900 border border-rose-200 font-medium">
              Reopening will alert department leads and escalate the issue back to "In Progress".
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Reopening *</label>
              <textarea
                rows={3}
                required
                placeholder="Explain why the issue is still not resolved..."
                value={reopenReason}
                onChange={e => setReopenReason(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReopenModalOpen(false)}
                className="m3-button-tonal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition-all shadow-xs"
              >
                Confirm Reopen
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
