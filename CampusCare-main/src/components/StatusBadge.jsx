import React from "react";

export default function StatusBadge({ status }) {
  const s = (status || "Pending").toLowerCase();

  let colorClasses = "bg-neutral-100 text-neutral-700 border border-neutral-200";

  if (s === "submitted" || s === "open" || s === "pending" || s === "reported") {
    colorClasses = "bg-amber-50 text-amber-800 border border-amber-200";
  } else if (s === "in progress" || s === "under review" || s === "assigned" || s === "matched" || s === "claim requested") {
    colorClasses = "bg-blue-50 text-blue-800 border border-blue-200";
  } else if (s === "resolved" || s === "verified" || s === "returned" || s === "approved" || s === "joined") {
    colorClasses = "bg-emerald-50 text-emerald-800 border border-emerald-200";
  } else if (s === "closed" || s === "rejected" || s === "cancelled") {
    colorClasses = "bg-rose-50 text-rose-800 border border-rose-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase ${colorClasses}`}
    >
      {status || "Pending"}
    </span>
  );
}
