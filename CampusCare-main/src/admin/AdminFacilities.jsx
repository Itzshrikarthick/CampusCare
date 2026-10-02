import { useState, useEffect } from "react";
import { fetchFacilities, updateFacilityStatus, clearFacilityBookings } from "../api";
import { DoorOpen, CheckCircle, XCircle, Trash2, ShieldAlert } from "lucide-react";

function AdminFacilities() {
  const [facilities, setFacilities] = useState([]);

  const loadFacilities = async () => {
    const data = await fetchFacilities();
    setFacilities(data);
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const updated = await updateFacilityStatus(id, newStatus);
    if (updated) {
      setFacilities(facilities.map(f => f.id === id ? updated : f));
    }
  };

  const handleClearBookings = async (id) => {
    if (window.confirm("Are you sure you want to clear all bookings for this facility? This will cancel students' reservations.")) {
      const updated = await clearFacilityBookings(id);
      if (updated) {
        setFacilities(facilities.map(f => f.id === id ? updated : f));
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Facilities</h1>
        <p className="text-slate-500 text-sm mt-1">Update availability and manage space bookings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {facilities.map(fac => (
          <div key={fac.id} className="m3-card-interactive overflow-hidden p-6 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  fac.status === "Available" ? "bg-emerald-50 text-emerald-600" :
                  fac.status === "Booked" ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                }`}>
                  <DoorOpen size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-black tracking-tight">{fac.name}</h3>
                  <p className="text-sm text-neutral-500 font-medium">{fac.type} • Capacity: {fac.capacity}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 mb-6 flex-1">
              <h4 className="font-bold text-sm text-black mb-3 border-b border-neutral-200 pb-2">Current Bookings ({fac.bookings?.length || 0})</h4>
              {fac.bookings?.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {fac.bookings.map((b, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-neutral-700">{b.bookedBy}</span>
                      <span className="text-neutral-500 bg-white px-2 py-1 rounded-md border border-neutral-200">{b.timeSlot}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 italic">No active bookings.</p>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-600 mr-2">Override Status:</span>
                <select 
                  value={fac.status} 
                  onChange={(e) => handleStatusChange(fac.id, e.target.value)}
                  className="flex-1 bg-white border border-neutral-200 text-sm rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-black outline-none transition-shadow"
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              
              <button 
                onClick={() => handleClearBookings(fac.id)}
                disabled={!fac.bookings?.length && fac.status === "Available"}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  fac.bookings?.length || fac.status !== "Available" 
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                }`}
              >
                <Trash2 size={16} />
                Clear Bookings & Reset
              </button>
            </div>
          </div>
        ))}
        {facilities.length === 0 && (
           <div className="col-span-full bg-white border border-neutral-200 rounded-3xl p-12 text-center text-neutral-500">
             No facilities registered in the system.
           </div>
        )}
      </div>
    </div>
  );
}

export default AdminFacilities;
