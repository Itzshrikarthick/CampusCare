import React, { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { fetchSyllabus, createSyllabus, deleteSyllabus } from "../api.js";
import Toast from "../components/Toast.jsx";
import Modal from "../components/Modal.jsx";

const DEPARTMENTS = ["CSE", "IT", "AI&DS", "AIML", "ECE", "EEE", "Mechanical", "Civil"];
const REGULATIONS = ["R2023", "R2021", "R2025"];

export default function AdminSyllabus() {
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    department: "CSE",
    regulation: "R2023",
    semester: 5,
    credits: 4,
    objectives: "",
    unit1: "",
    unit2: "",
    unit3: "",
    unit4: "",
    unit5: "",
    textbooks: ""
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchSyllabus().then((data) => {
      if (isMounted) {
        setSyllabusList(data || []);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name) return;

    const payload = {
      code: form.code,
      name: form.name,
      department: form.department,
      regulation: form.regulation,
      semester: parseInt(form.semester),
      credits: parseInt(form.credits),
      objectives: form.objectives ? form.objectives.split("\n") : ["To study core fundamentals."],
      courseOutcomes: ["CO1: Master subject concepts.", "CO2: Apply in projects."],
      units: [
        { unitNumber: 1, title: "Unit 1 Concepts", content: form.unit1 || "Fundamentals and basic principles." },
        { unitNumber: 2, title: "Unit 2 Intermediate", content: form.unit2 || "Intermediate architectures and methods." },
        { unitNumber: 3, title: "Unit 3 Advanced", content: form.unit3 || "Advanced theories and implementations." },
        { unitNumber: 4, title: "Unit 4 Applications", content: form.unit4 || "Practical application and case studies." },
        { unitNumber: 5, title: "Unit 5 Case Studies", content: form.unit5 || "Emerging trends and research papers." }
      ],
      textbooks: form.textbooks ? form.textbooks.split("\n") : ["Standard University Press Textbook"],
      referenceBooks: ["Reference Handbook"]
    };

    const created = await createSyllabus(payload);
    if (created) {
      setSyllabusList([...syllabusList, created]);
      setIsAddModalOpen(false);
      showToast("success", "Syllabus entry added!");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete syllabus entry?")) {
      await deleteSyllabus(id);
      setSyllabusList(syllabusList.filter(s => s.id !== id));
      showToast("info", "Entry deleted.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-neutral-900" />
            Academic Syllabus Management
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Organize course structures, 5-unit breakdowns, and textbook references by department & regulation.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="m3-button-filled self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Subject Syllabus
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">Loading syllabus list...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Code & Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Regulation</th>
                  <th className="p-4">Semester</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {syllabusList.map(s => (
                  <tr key={s.id} className="hover:bg-neutral-50/50">
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{s.code}</div>
                      <div className="font-semibold text-neutral-900">{s.name}</div>
                    </td>
                    <td className="p-4 text-neutral-600">{s.department}</td>
                    <td className="p-4 font-semibold text-neutral-800">{s.regulation}</td>
                    <td className="p-4 text-neutral-600">Sem {s.semester}</td>
                    <td className="p-4 font-bold text-neutral-800">{s.credits} Cr</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD SYLLABUS MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Subject Syllabus Entry" maxWidth="max-w-3xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Subject Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS3501"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Database Management Systems"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Department</label>
              <select
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Regulation</label>
              <select
                value={form.regulation}
                onChange={e => setForm({ ...form, regulation: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              >
                {REGULATIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Semester</label>
              <input
                type="number"
                value={form.semester}
                onChange={e => setForm({ ...form, semester: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Credits</label>
              <input
                type="number"
                value={form.credits}
                onChange={e => setForm({ ...form, credits: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Unit 1 Syllabus Summary</label>
            <input
              type="text"
              placeholder="Unit 1 Topics..."
              value={form.unit1}
              onChange={e => setForm({ ...form, unit1: e.target.value })}
              className="w-full p-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Unit 2 Syllabus Summary</label>
            <input
              type="text"
              placeholder="Unit 2 Topics..."
              value={form.unit2}
              onChange={e => setForm({ ...form, unit2: e.target.value })}
              className="w-full p-2 bg-neutral-50 rounded-xl border border-neutral-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Subject Syllabus
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
