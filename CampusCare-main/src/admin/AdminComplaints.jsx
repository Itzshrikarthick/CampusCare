import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  BarChart3,
  Trash2,
  Sparkles
} from "lucide-react";
import { fetchComplaints, updateComplaintStatus, clearAllComplaints } from "../api.js";
import { generateAdminResolutionDraft } from "../services/aiAgentService.js";
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

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    assignedTo: "",
    eta: "",
    adminRemarks: "",
    comment: ""
  });

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

  const openEditModal = (comp) => {
    setSelectedComplaint(comp);
    setEditForm({
      status: comp.status,
      assignedTo: comp.assignedTo || "",
      eta: comp.eta ? comp.eta.split("T")[0] : "",
      adminRemarks: comp.adminRemarks || "",
      comment: ""
    });
  };

  const handleAIDraft = async () => {
    if (!selectedComplaint) return;
    const draft = await generateAdminResolutionDraft(selectedComplaint);
    setEditForm(prev => ({
      ...prev,
      status: "Resolved",
      comment: draft.statusUpdateComment
    }));
    showToast("success", "AI generated official resolution response.");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    const payload = {
      status: editForm.status,
      assignedTo: editForm.assignedTo,
      eta: editForm.eta ? new Date(editForm.eta).toISOString() : "",
      adminRemarks: editForm.adminRemarks,
      comment: editForm.comment || `Updated status to ${editForm.status}`,
      author: "Admin"
    };

    const updated = await updateComplaintStatus(selectedComplaint.id, payload);
    if (updated) {
      setComplaints(complaints.map(c => (c.id === selectedComplaint.id ? updated : c)));
      setSelectedComplaint(null);
      showToast("success", "Complaint updated successfully!");
    }
  };

  const handleExportCSV = () => {
    if (complaints.length === 0) return;

    const headers = ["ID", "Title", "Category", "Priority", "Status", "Location", "AssignedTo", "CreatedDate"];
    const rows = complaints.map(c => [
      c.id,
      `"${(c.title || "").replace(/"/g, '""')}"`,
      c.category,
      c.priority || "Medium",
      c.status,
      `"${(c.location || "").replace(/"/g, '""')}"`,
      `"${(c.assignedTo || "").replace(/"/g, '""')}"`,
      c.createdAt || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campuscare_complaints_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("success", "Complaints report exported as CSV.");
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear ALL complaints?")) {
      await clearAllComplaints();
      setComplaints([]);
      showToast("info", "All complaints cleared.");
    }
  };

  // Analytics Metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === "Submitted" || c.status === "Pending").length;
  const inProgressCount = complaints.filter(c => c.status === "In Progress" || c.status === "Assigned" || c.status === "Under Review").length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length;

  const filteredComplaints = complaints.filter(c => {
    const matchesDept = deptFilter === "All" || c.category === deptFilter;
    const matchesPriority = priorityFilter === "All" || c.priority === priorityFilter;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesSearch =
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assignedTo || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesPriority && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-neutral-900" />
            Admin Complaint Operations & Analytics
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Assign staff leads, set resolution ETAs, review department metrics, and export compliance reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="m3-button-filled"
          >
            <Download className="w-4 h-4" /> Export Report (CSV)
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Complaints</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{totalCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Submitted / Pending</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">In Progress / Assigned</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{inProgressCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved / Closed</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{resolvedCount}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search title, staff..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 rounded-xl text-sm border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="w-full py-2 px-3 bg-neutral-50 rounded-xl text-sm border border-neutral-200"
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>Dept: {d}</option>)}
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full py-2 px-3 bg-neutral-50 rounded-xl text-sm border border-neutral-200"
          >
            <option value="All">Priority: All</option>
            <option value="Low">Priority: Low</option>
            <option value="Medium">Priority: Medium</option>
            <option value="High">Priority: High</option>
            <option value="Urgent">Priority: Urgent</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-neutral-50 rounded-xl text-sm border border-neutral-200"
          >
            <option value="All">Status: All</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="py-20 text-center text-neutral-400">Loading complaints table...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Complaint</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Assigned Staff</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {filteredComplaints.map(comp => (
                  <tr key={comp.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{comp.title}</div>
                      <div className="text-xs text-neutral-400 truncate max-w-xs">{comp.location}</div>
                    </td>
                    <td className="p-4 font-medium text-neutral-700">{comp.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        comp.priority === "Urgent" || comp.priority === "High" ? "bg-rose-50 text-rose-700" : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {comp.priority || "Medium"}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600 font-medium">
                      {comp.assignedTo || <span className="text-neutral-400 italic">Unassigned</span>}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={comp.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditModal(comp)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                      >
                        Manage & Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANAGE & ASSIGN MODAL */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Manage Complaint — ${selectedComplaint.title}`}
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Status Workflow Stage</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Assign Staff / Technician</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar (HVAC Lead)"
                  value={editForm.assignedTo}
                  onChange={e => setEditForm({ ...editForm, assignedTo: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Set Resolution ETA Date</label>
                <input
                  type="date"
                  value={editForm.eta}
                  onChange={e => setEditForm({ ...editForm, eta: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Admin Internal Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Parts ordered from vendor."
                  value={editForm.adminRemarks}
                  onChange={e => setEditForm({ ...editForm, adminRemarks: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-700">Add Timeline Log Message to Student</label>
                <button
                  type="button"
                  onClick={handleAIDraft}
                  className="m3-ai-button text-[11px] py-1 px-3"
                >
                  <Sparkles className="w-3 h-3 text-purple-200 animate-pulse" /> AI Draft Resolution Response
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Explain current status update or next steps..."
                value={editForm.comment}
                onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Save Changes & Notify
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
