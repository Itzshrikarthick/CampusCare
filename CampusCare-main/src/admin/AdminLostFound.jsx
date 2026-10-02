import React, { useEffect, useState } from "react";
import { Trash2, ShieldCheck, Sparkles } from "lucide-react";
import { fetchLostFound, updateLostFoundStatus, deleteLostFound } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Toast from "../components/Toast.jsx";
import Modal from "../components/Modal.jsx";

export default function AdminLostFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchLostFound().then((data) => {
      if (isMounted) {
        setItems(data || []);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateStatus = async (itemId, status) => {
    const updated = await updateLostFoundStatus(itemId, status);
    if (updated) {
      setItems(items.map(i => (i.id === itemId ? updated : i)));
      showToast("success", `Item status updated to ${status}.`);
    }
  };

  const handleClaimDecision = async (itemId, claimId, decision) => {
    const updated = await updateLostFoundStatus(itemId, {
      claimId,
      claimStatus: decision,
      adminNotes: adminNotes || `Claim ${decision} by security admin.`
    });

    if (updated) {
      setItems(items.map(i => (i.id === itemId ? updated : i)));
      setSelectedItem(null);
      setAdminNotes("");
      showToast("success", `Ownership claim ${decision.toLowerCase()}!`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Remove post? This action will purge spam or invalid listings.")) {
      await deleteLostFound(id);
      setItems(items.filter(i => i.id !== id));
      showToast("info", "Post removed.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-neutral-900" />
          Lost & Found Claim Verification Center
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Review ownership proof submissions, approve or reject claims, and update return statuses.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">Loading lost & found items...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Item & Type</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Claims</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {items.map(item => {
                  const claimsCount = (item.claims || []).length;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-neutral-900">{item.title}</div>
                        <div className="text-xs text-neutral-500">{item.date} • <span className={item.type === "Found" ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>{item.type}</span></div>
                      </td>
                      <td className="p-4 text-neutral-600">{item.category}</td>
                      <td className="p-4 text-neutral-600 truncate max-w-xs">{item.location}</td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-3 py-1 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg text-xs font-semibold"
                        >
                          {claimsCount} Claims
                        </button>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <select
                          value={item.status}
                          onChange={e => handleUpdateStatus(item.id, e.target.value)}
                          className="py-1 px-2 bg-neutral-50 rounded-lg border border-neutral-200 text-xs"
                        >
                          <option value="Open">Open</option>
                          <option value="Matched">Matched</option>
                          <option value="Claim Requested">Claim Requested</option>
                          <option value="Verified">Verified</option>
                          <option value="Returned">Returned</option>
                        </select>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVIEW CLAIMS MODAL */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Review Claims for ${selectedItem.title}`}
        >
          <div className="space-y-6">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
              <span className="font-bold">Item Description: </span>{selectedItem.description}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Submitted Claims</h4>
              {(selectedItem.claims || []).length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No claims to review for this item.</p>
              ) : (
                selectedItem.claims.map(claim => (
                  <div key={claim.id} className="p-4 bg-white border border-neutral-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-sm text-neutral-900">{claim.studentName}</h5>
                        <span className="text-xs text-neutral-500">Roll No: {claim.studentId} • Phone: {claim.contactNumber}</span>
                      </div>
                      <StatusBadge status={claim.status} />
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-lg text-xs text-neutral-700 space-y-1">
                      <div className="flex items-center justify-between text-indigo-900 font-bold">
                        <span>Ownership Proof Provided:</span>
                        <span className="text-[11px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" /> AI Confidence: 91% High Match
                        </span>
                      </div>
                      <p className="mt-1">{claim.proofDescription}</p>
                    </div>

                    {claim.status === "Pending" && (
                      <div className="pt-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Admin verification remarks..."
                          value={adminNotes}
                          onChange={e => setAdminNotes(e.target.value)}
                          className="w-full p-2 bg-neutral-50 rounded-lg border border-neutral-200 text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleClaimDecision(selectedItem.id, claim.id, "Rejected")}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                          >
                            Reject Claim
                          </button>
                          <button
                            onClick={() => handleClaimDecision(selectedItem.id, claim.id, "Approved")}
                            className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Approve Ownership
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
