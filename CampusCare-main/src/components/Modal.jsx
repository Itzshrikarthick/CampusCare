import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-neutral-200/60 z-10 overflow-hidden animate-in fade-in slide-in-from-bottom-2`}>
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-black tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-black rounded-xl hover:bg-neutral-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
