import { useNavigate } from "react-router-dom";

export default function ReportEmergency() {
  const navigate = useNavigate();
  return (
    <div className="p-8 text-center space-y-4">
      <h2 className="text-xl font-bold">Emergency Reporting</h2>
      <p className="text-neutral-500">Emergency reporting has been merged into the main File Issue / Emergency page.</p>
      <button
        onClick={() => navigate("/file-complaint")}
        className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-xl text-sm"
      >
        Go to File Issue & Emergency
      </button>
    </div>
  );
}
