import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Sparkles } from "lucide-react";

const ROLE_KEY = "campuscare-role";
const ID_KEY = "campuscare-userId";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const existingRole = localStorage.getItem(ROLE_KEY);
    if (existingRole === "admin") {
      navigate("/admin", { replace: true });
    } else if (existingRole === "student") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(ID_KEY, userId.trim());
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-[420px] bg-white border border-neutral-200/60 rounded-3xl p-8 sm:p-10 shadow-sm align-middle">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white mb-6 shadow-md shadow-black/10">
            <Sparkles size={28} />
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight mb-2">CampusCare</h1>
          <p className="text-sm font-medium text-neutral-500">Sign in to report and track issues</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-black tracking-tight">University ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your Student or Admin ID"
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-black text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-black tracking-tight flex justify-between">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all ${role === "student"
                    ? "border-black bg-black text-white shadow-md shadow-black/10"
                    : "border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200 hover:bg-neutral-50"
                  }`}
              >
                <User size={20} className={role === "student" ? "text-white" : "text-neutral-400"} />
                <span className="text-sm font-bold">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all ${role === "admin"
                    ? "border-black bg-black text-white shadow-md shadow-black/10"
                    : "border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200 hover:bg-neutral-50"
                  }`}
              >
                <Shield size={20} className={role === "admin" ? "text-white" : "text-neutral-400"} />
                <span className="text-sm font-bold">Admin</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-3.5 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 hover:shadow-lg hover:shadow-black/10 transition-all active:scale-[0.98]"
            >
              Continue to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
