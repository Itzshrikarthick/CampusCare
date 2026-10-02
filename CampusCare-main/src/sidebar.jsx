import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  Calendar,
  PackageSearch,
  GraduationCap,
  BookOpen,
  LogOut,
  X,
  Sparkles
} from "lucide-react";

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("campuscare-role");
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/events", label: "Events & Clubs", icon: Calendar },
    { path: "/lostfound", label: "Lost & Found", icon: PackageSearch },
    { path: "/honours-minors", label: "Honours & Minors", icon: GraduationCap },
    { path: "/syllabus", label: "Academic Syllabus", icon: BookOpen },
    { path: "/complaints", label: "My Complaints", icon: ClipboardList },
    { path: "/file-complaint", label: "Report Issue / Emergency", icon: FilePlus }
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200/80 flex flex-col h-screen sticky top-0 shadow-xs">
      <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-md shadow-black/10">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="font-bold text-neutral-900 leading-tight">CampusCare</div>
            <div className="text-[11px] text-neutral-400 font-medium">Student Portal</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const IconComp = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-neutral-900 text-white font-bold shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`
              }
            >
              <IconComp size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}