import { useState, useEffect } from "react";
import { fetchCafeteria, updateCafeteriaData } from "../api";
import { Coffee, Users, MapPin, Activity, Calendar, Plus, Trash2 } from "lucide-react";

function AdminCafeteria() {
  const [cafeterias, setCafeterias] = useState([]);
  const [activeEventForm, setActiveEventForm] = useState(null);
  const [eventForm, setEventForm] = useState({ title: "", date: "" });

  const loadCafeterias = async () => {
    const data = await fetchCafeteria();
    setCafeterias(data);
  };

  useEffect(() => {
    loadCafeterias();
  }, []);

  const handleUpdate = async (id, field, value) => {
    const dataToUpdate = {};
    if (field === "crowdStatus") {
      dataToUpdate.crowdStatus = value;
    } else if (field === "events") {
      dataToUpdate.events = value;
    } else {
      // field is something like "menu.breakfast"
      const meal = field.split(".")[1];
      const cafe = cafeterias.find(c => c.id === id);
      dataToUpdate.menu = { ...cafe.menu, [meal]: value };
    }

    const updated = await updateCafeteriaData(id, dataToUpdate);
    if (updated) {
      setCafeterias(cafeterias.map(c => c.id === id ? updated : c));
    }
  };

  const handleAddEvent = async (cafeId) => {
    if (!eventForm.title || !eventForm.date) return;
    const cafe = cafeterias.find(c => c.id === cafeId);
    const updatedEvents = [...(cafe.events || []), { id: Date.now().toString(), title: eventForm.title, date: eventForm.date }];
    await handleUpdate(cafeId, "events", updatedEvents);
    setActiveEventForm(null);
    setEventForm({ title: "", date: "" });
  };

  const handleRemoveEvent = async (cafeId, eventId) => {
    const cafe = cafeterias.find(c => c.id === cafeId);
    const updatedEvents = (cafe.events || []).filter(e => e.id !== eventId);
    await handleUpdate(cafeId, "events", updatedEvents);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Cafeteria & Mess</h1>
        <p className="text-slate-500 text-sm mt-1">Update daily menus and real-time crowd status.</p>
      </div>

      <div className="flex flex-col gap-8">
        {cafeterias.map(cafe => (
          <div key={cafe.id} className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
            
            {/* Status Section */}
            <div className="md:w-1/3 bg-neutral-50 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Coffee size={24} strokeWidth={2.5}/>
                 </div>
                 <div>
                    <h2 className="font-bold text-xl text-black tracking-tight">{cafe.name}</h2>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mt-1">Status Control</p>
                 </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-600 flex items-center gap-2"><Activity size={16}/> Live Crowd Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'High'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdate(cafe.id, "crowdStatus", status)}
                      className={`py-2 rounded-xl text-sm font-bold transition-all border ${
                        cafe.crowdStatus === status
                          ? status === 'Low' ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                          : status === 'Medium' ? 'bg-amber-100 border-amber-200 text-amber-700'
                          : 'bg-rose-100 border-rose-200 text-rose-700'
                          : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-xs text-neutral-400 font-medium">
                Last updated: {new Date(cafe.updatedAt).toLocaleTimeString()}
              </div>
            </div>

            {/* Menu Section */}
            <div className="p-6 sm:p-8 flex-1">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><MapPin size={20} className="text-neutral-400" /> Daily Menu Management</h3>
              
              <div className="space-y-5">
                {['breakfast', 'lunch', 'dinner'].map((meal) => (
                  <div key={meal} className="flex flex-col">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">{meal}</label>
                    <textarea 
                      value={cafe.menu[meal]}
                      onChange={(e) => handleUpdate(cafe.id, `menu.${meal}`, e.target.value)}
                      placeholder={`Enter ${meal} menu items...`}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-shadow min-h-[80px] resize-y"
                    />
                  </div>
                ))}
              </div>

              {/* Special Events Section */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Calendar size={20} className="text-neutral-400" /> Special Events</h3>
                  <button 
                    onClick={() => setActiveEventForm(activeEventForm === cafe.id ? null : cafe.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <Plus size={14} /> Add Event
                  </button>
                </div>

                {activeEventForm === cafe.id && (
                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl mb-4 flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="Event Title (e.g. Seafood Fest)" 
                      value={eventForm.title} 
                      onChange={e => setEventForm({...eventForm, title: e.target.value})}
                      className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                    <input 
                      type="date" 
                      value={eventForm.date} 
                      onChange={e => setEventForm({...eventForm, date: e.target.value})}
                      className="px-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                    <button 
                      onClick={() => handleAddEvent(cafe.id)}
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold text-sm rounded-lg hover:bg-emerald-200 transition-colors shrink-0"
                    >
                      Save
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {!(cafe.events?.length > 0) ? (
                    <p className="text-sm text-neutral-400 italic py-2">No special events scheduled.</p>
                  ) : (
                    cafe.events.map(ev => (
                      <div key={ev.id} className="flex items-center justify-between bg-white border border-neutral-100 p-3 rounded-xl shadow-sm">
                        <div>
                          <p className="font-bold text-sm text-black">{ev.title}</p>
                          <p className="text-xs text-neutral-500 font-medium flex items-center gap-1 mt-0.5"><Calendar size={12}/> {new Date(ev.date).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveEvent(cafe.id, ev.id)}
                          className="w-8 h-8 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
            
          </div>
        ))}

        {cafeterias.length === 0 && (
           <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center text-neutral-500">
             No cafeteria data available.
           </div>
        )}
      </div>
    </div>
  );
}

export default AdminCafeteria;
