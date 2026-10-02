import { useState, useEffect } from "react";
import { fetchCafeteria } from "../api";
import { Coffee, Utensils, Pizza, Activity, Calendar } from "lucide-react";

function Cafeteria() {
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    fetchCafeteria().then(setCafes);
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Live Cafeteria Status</h1>
        <p className="text-sm sm:text-base text-neutral-500 mt-2">Check today's menus and live campus dining crowd levels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {cafes.map(cafe => (
          <div key={cafe.id} className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/50">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Coffee size={24} />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-black tracking-tight">{cafe.name}</h2>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cafe.crowdStatus === 'High' ? 'bg-rose-400' : 'bg-green-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${cafe.crowdStatus === 'High' ? 'bg-rose-500' : 'bg-green-500'}`}></span>
                      </span>
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Crowd: {cafe.crowdStatus}</span>
                   </div>
                 </div>
               </div>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
               <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-black mb-2 uppercase tracking-wide">
                     <Utensils size={16} className="text-amber-500" /> Breakfast
                  </div>
                  <p className="text-neutral-600 leading-relaxed font-medium">{cafe.menu.breakfast}</p>
               </div>
               <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-black mb-2 uppercase tracking-wide">
                     <Pizza size={16} className="text-rose-500" /> Lunch
                  </div>
                  <p className="text-neutral-600 leading-relaxed font-medium">{cafe.menu.lunch}</p>
               </div>
               <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-black mb-2 uppercase tracking-wide">
                     <Activity size={16} className="text-purple-500" /> Dinner
                  </div>
                  <p className="text-neutral-600 leading-relaxed font-medium">{cafe.menu.dinner}</p>
               </div>
            </div>

            {cafe.events?.length > 0 && (
              <div className="bg-emerald-50/50 p-6 sm:p-8 border-t border-emerald-100">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-4 uppercase tracking-wide">
                  <Calendar size={18} className="text-emerald-600" /> Special Events
                </div>
                <div className="space-y-3">
                  {cafe.events.map(ev => (
                    <div key={ev.id} className="flex justify-between items-center bg-white border border-emerald-100 p-3 rounded-xl shadow-sm">
                      <span className="font-bold text-sm text-black">{ev.title}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">{new Date(ev.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cafeteria;
