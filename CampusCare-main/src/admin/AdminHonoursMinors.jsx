import React, { useEffect, useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { fetchHonoursMinors, createHonoursMinor, fetchHMApplications, updateHMApplicationStatus } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Toast from "../components/Toast.jsx";
import Modal from "../components/Modal.jsx";

export default function AdminHonoursMinors() {
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applications");

  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
  const [programForm, setProgramForm] = useState({
    title: "",
    type: "Honours",
    offeringDepartment: "CSE",
    eligibleDepartments: ["CSE", "IT", "AI&DS", "AIML"],
    minCGPA: 8.5,
    totalCredits: 18,
    coreCredits: 12,
    projectCredits: 6,
    description: "",
    regulation: "R2023"
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchHonoursMinors(), fetchHMApplications()]).then(([pData, aData]) => {
      if (isMounted) {
        setPrograms(pData || []);
        setApplications(aData || []);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAppStatus = async (appId, newStatus) => {
    const updated = await updateHMApplicationStatus(appId, newStatus);
    if (updated) {
      setApplications(applications.map(a => (a.id === appId ? updated : a)));
      showToast("success", `Application status updated to ${newStatus}.`);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!programForm.title) return;
    const created = await createHonoursMinor(programForm);
    if (created) {
      setPrograms([...programs, created]);
      setIsAddProgramModalOpen(false);
      showToast("success", "New Honours/Minor program published!");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-neutral-900" />
            Honours & Minors Admin Portal
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Review student applications, set CGPA cutoffs, and manage degree programs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <div className="flex bg-neutral-200/60 p-1.5 rounded-full border border-neutral-300/60">
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === "applications" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("programs")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === "programs" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Programs ({programs.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddProgramModalOpen(true)}
            className="m3-button-filled"
          >
            <Plus className="w-4 h-4" /> Add Program
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">Loading data...</div>
      ) : activeTab === "applications" ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Applied Program</th>
                  <th className="p-4">CGPA</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-neutral-50/50">
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{app.studentName}</div>
                      <div className="text-xs text-neutral-500">{app.studentId} • {app.department} Dept</div>
                    </td>
                    <td className="p-4 font-semibold text-neutral-900">{app.programTitle}</td>
                    <td className="p-4 font-bold text-neutral-800">{app.cgpa}</td>
                    <td className="p-4"><StatusBadge status={app.status} /></td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleAppStatus(app.id, "Approved")}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAppStatus(app.id, "Rejected")}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map(prog => (
            <div key={prog.id} className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
                  {prog.type} ({prog.regulation})
                </span>
                <span className="text-xs text-neutral-500 font-semibold">Min CGPA: {prog.minCGPA}</span>
              </div>
              <h3 className="font-bold text-neutral-900 text-lg">{prog.title}</h3>
              <p className="text-xs text-neutral-600">{prog.description}</p>
              <div className="text-xs text-neutral-400 border-t border-neutral-100 pt-2">
                Eligible: {prog.eligibleDepartments?.join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD PROGRAM MODAL */}
      <Modal isOpen={isAddProgramModalOpen} onClose={() => setIsAddProgramModalOpen(false)} title="Add Degree Program">
        <form onSubmit={handleCreateProgram} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Program Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Honours in Artificial Intelligence"
              value={programForm.title}
              onChange={e => setProgramForm({ ...programForm, title: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Degree Type</label>
              <select
                value={programForm.type}
                onChange={e => setProgramForm({ ...programForm, type: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              >
                <option value="Honours">Honours</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Minimum Required CGPA</label>
              <input
                type="number"
                step="0.1"
                value={programForm.minCGPA}
                onChange={e => setProgramForm({ ...programForm, minCGPA: parseFloat(e.target.value) })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={programForm.description}
              onChange={e => setProgramForm({ ...programForm, description: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsAddProgramModalOpen(false)}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Publish Program
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
