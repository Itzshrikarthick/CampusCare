import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FileComplaint from "./pages/FileComplaint.jsx";
import ReportEmergency from "./pages/ReportEmergency.jsx";
import MyComplaints from "./pages/MyComplaints.jsx";
import Login from "./pages/Login.jsx";
import Events from "./pages/Events.jsx";
import LostFound from "./pages/LostFound.jsx";
import HonoursMinors from "./pages/HonoursMinors.jsx";
import Syllabus from "./pages/Syllabus.jsx";

import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminComplaints from "./admin/AdminComplaints.jsx";
import AdminEmergencies from "./admin/AdminEmergencies.jsx";
import AdminEvents from "./admin/AdminEvents.jsx";
import AdminLostFound from "./admin/AdminLostFound.jsx";
import AdminHonoursMinors from "./admin/AdminHonoursMinors.jsx";
import AdminSyllabus from "./admin/AdminSyllabus.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="file-complaint" element={<FileComplaint />} />
          <Route path="report-emergency" element={<ReportEmergency />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="events" element={<Events />} />
          <Route path="lostfound" element={<LostFound />} />
          <Route path="honours-minors" element={<HonoursMinors />} />
          <Route path="syllabus" element={<Syllabus />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="emergencies" element={<AdminEmergencies />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="lostfound" element={<AdminLostFound />} />
          <Route path="honours-minors" element={<AdminHonoursMinors />} />
          <Route path="syllabus" element={<AdminSyllabus />} />
        </Route>
        {/* Catch-all fallback route to prevent blank screens */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
