import { useState, useEffect } from "react";
import { fetchFacilities, bookFacility } from "../api";
import { DoorOpen, Users, Clock, CalendarCheck } from "lucide-react";

function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [bookingFor, setBookingFor] = useState(null);
  const [timeSlot, setTimeSlot] = useState("09:00 - 11:00");

  useEffect(() => {
    fetchFacilities().then(setFacilities);
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingFor) return;
    const updated = await bookFacility(bookingFor.id, timeSlot);
    if (updated) {
      setFacilities(prev => prev.map(f => f.id === updated.id ? updated : f));
      setBookingFor(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Facility Booking</h1>
        <p className="text-sm sm:text-base text-neutral-500 mt-2">Reserve study rooms, sports courts, and auditoriums.</p>
      </div>

      {bookingFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
           <form onSubmit={handleBook} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <h2 className="text-xl font-bold mb-4">Book {bookingFor.name}</h2>
             <div className="mb-6 space-y-3">
               <label className="text-sm font-bold text-black">Select Time Slot</label>
               <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium">
                 <option>09:00 - 11:00</option>
                 <option>11:00 - 13:00</option>
                 <option>14:00 - 16:00</option>
                 <option>16:00 - 18:00</option>
               </select>
             </div>
             <div className="flex gap-3">
               <button type="submit" className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-bold">Confirm Booking</button>
               <button type="button" onClick={() => setBookingFor(null)} className="px-4 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200">Cancel</button>
             </div>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {facilities.map(fac => (
          <div key={fac.id} className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <DoorOpen size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${fac.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                {fac.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-black tracking-tight mb-2">{fac.name}</h3>
            
            <div className="flex flex-col gap-2 mb-6 text-sm font-semibold text-neutral-600">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-neutral-400" /> Capacity: {fac.capacity} People
              </div>
              <div className="flex items-center gap-2">
                <CalendarCheck size={16} className="text-neutral-400" /> Type: {fac.type}
              </div>
              {fac.bookings.length > 0 && (
                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-neutral-100">
                  <Clock size={16} className="text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-neutral-400 mb-1 text-xs">Today's Bookings:</span>
                    {fac.bookings.map((b, i) => (
                      <div key={i} className="text-xs bg-neutral-100 px-2 py-1 rounded-md inline-block mr-2 mb-1">
                        {b.timeSlot} ({b.bookedBy})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
               onClick={() => setBookingFor(fac)}
               className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-black text-white hover:bg-neutral-800`}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Facilities;
