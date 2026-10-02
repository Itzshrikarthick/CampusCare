import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar.jsx";
import AIAssistantWidget from "./components/AIAssistantWidget.jsx";

function App() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = (typeof window !== "undefined" ? localStorage.getItem("campuscare-role") : null) || "student";

  useEffect(() => {
    if (!localStorage.getItem("campuscare-role")) {
      localStorage.setItem("campuscare-role", "student");
    }
    if (role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [role, navigate]);

  if (role === "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-auto w-full md:w-auto min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-neutral-200/60 sticky top-0 z-30 shadow-sm">
          <div className="font-bold text-lg tracking-tight">CampusCare</div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <Outlet />
      </main>
      <AIAssistantWidget mode="student" />
    </div>
  );
}

export default App;
