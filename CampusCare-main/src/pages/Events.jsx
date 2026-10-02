import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  User,
  Search,
  Users,
  Award,
  Sparkles,
  Filter,
  Globe,
  ExternalLink
} from "lucide-react";
import {
  fetchEvents,
  registerEvent,
  cancelEventRegistration,
  fetchClubs,
  joinClub
} from "../api.js";
import Toast from "../components/Toast.jsx";
import Modal from "../components/Modal.jsx";

const DEPARTMENTS = [
  "All",
  "CSE",
  "IT",
  "AI&DS",
  "AIML",
  "ECE",
  "EEE",
  "Mechanical",
  "Civil"
];

const CATEGORIES = ["All", "Academic", "Technical", "Sports", "Cultural", "Workshop"];

export default function Events() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTimeFilter, setEventTimeFilter] = useState("upcoming");
  const [scopeFilter, setScopeFilter] = useState("all");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [certificateModalEvent, setCertificateModalEvent] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);

  const [toast, setToast] = useState(null);
  const userEmail = "student1@campuscare.edu";

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchEvents(), fetchClubs()]).then(([eventsData, clubsData]) => {
      if (isMounted) {
        setEvents(eventsData || []);
        setClubs(clubsData || []);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRegister = async (eventId) => {
    const updated = await registerEvent(eventId, userEmail);
    if (updated) {
      setEvents(events.map(e => (e.id === eventId ? updated : e)));
      if (selectedEvent?.id === eventId) setSelectedEvent(updated);
      showToast("success", "Successfully registered for the event!");
    }
  };

  const handleCancelRegistration = async (eventId) => {
    const updated = await cancelEventRegistration(eventId, userEmail);
    if (updated) {
      setEvents(events.map(e => (e.id === eventId ? updated : e)));
      if (selectedEvent?.id === eventId) setSelectedEvent(updated);
      showToast("info", "Registration canceled.");
    }
  };

  const handleJoinClub = async (clubId) => {
    const updated = await joinClub(clubId, userEmail);
    if (updated) {
      setClubs(clubs.map(c => (c.id === clubId ? updated : c)));
      if (selectedClub?.id === clubId) setSelectedClub(updated);
      showToast("success", "Joined club successfully!");
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesDept = selectedDept === "All" || event.department === selectedDept;
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch =
      (event.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.hostCollege || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const isEventPast = new Date(event.date) < new Date(new Date().setHours(0,0,0,0));
    const matchesTime =
      eventTimeFilter === "all" ||
      (eventTimeFilter === "upcoming" && !isEventPast) ||
      (eventTimeFilter === "past" && isEventPast);

    const matchesScope =
      scopeFilter === "all" ||
      (scopeFilter === "internal" && event.eventScope !== "Inter-College") ||
      (scopeFilter === "external" && event.eventScope === "Inter-College");

    return matchesDept && matchesCategory && matchesSearch && matchesTime && matchesScope;
  });

  const filteredClubs = clubs.filter(club => {
    const matchesDept = selectedDept === "All" || club.department === selectedDept;
    const matchesSearch =
      (club.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Events & Student Clubs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Explore department events, register for hackathons, and join campus societies.
          </p>
        </div>

        <div className="flex bg-slate-200/60 p-1.5 rounded-full border border-slate-300/60 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("events")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "events"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Campus Events
          </button>
          <button
            onClick={() => setActiveTab("clubs")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "clubs"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Department Clubs
          </button>
        </div>
      </div>

      {/* M3 Department Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Department:
        </span>
        {DEPARTMENTS.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`m3-chip ${
              selectedDept === dept
                ? "m3-chip-filter-active"
                : "m3-chip-filter"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 m3-card p-4">
        <div className="relative md:col-span-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === "events" ? "Search events..." : "Search clubs..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full m3-search-bar"
          />
        </div>

        {activeTab === "events" && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 col-span-1 md:col-span-3 flex-wrap">
              <button
                onClick={() => setScopeFilter("all")}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                  scopeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                All Scope
              </button>
              <button
                onClick={() => setScopeFilter("internal")}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                  scopeFilter === "internal" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Campus Internal
              </button>
              <button
                onClick={() => setScopeFilter("external")}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                  scopeFilter === "external" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🌐 Inter-College (Outer)
              </button>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Loading activities...</div>
      ) : activeTab === "events" ? (
        filteredEvents.length === 0 ? (
          <div className="py-16 text-center m3-card p-8 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Events Found</h3>
            <p className="text-sm text-slate-400">Try adjusting your category or scope filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const isRegistered = (event.registrations || []).includes(userEmail);
              const isPast = new Date(event.date) < new Date(new Date().setHours(0,0,0,0));
              const isFull = (event.registeredCount || 0) >= (event.maxParticipants || 100);
              const isExternal = event.eventScope === "Inter-College";

              return (
                <div
                  key={event.id}
                  className={`m3-card-interactive overflow-hidden flex flex-col justify-between group ${
                    isExternal ? "border-indigo-200/80 shadow-indigo-100/30" : ""
                  }`}
                >
                  <div>
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img
                        src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                        {isExternal ? (
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-indigo-200" /> {event.hostCollege || "Inter-College"}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 shadow-xs">
                            {event.department || "General"}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 text-white shadow-xs">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="font-bold text-neutral-900 text-lg group-hover:text-black transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{event.date} at {event.time || "10:00 AM"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="flex items-center gap-1 text-slate-500 font-medium">
                            <Users className="w-3.5 h-3.5" />
                            {event.registeredCount || 0} / {event.maxParticipants || 100} Registered
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="m3-button-tonal flex-1 text-xs py-2"
                    >
                      Details
                    </button>

                    {isPast ? (
                      isRegistered ? (
                        <button
                          onClick={() => setCertificateModalEvent(event)}
                          className="px-4 py-2 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 rounded-full text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> Certificate
                        </button>
                      ) : (
                        <span className="px-3 py-2 text-xs font-medium text-slate-400 bg-slate-100 rounded-full text-center flex-1">
                          Ended
                        </span>
                      )
                    ) : isRegistered ? (
                      <button
                        onClick={() => handleCancelRegistration(event.id)}
                        className="px-4 py-2 bg-rose-100 text-rose-950 hover:bg-rose-200 rounded-full text-xs font-bold transition-all flex-1 text-center"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={isFull}
                        className={`m3-button-filled flex-1 text-xs py-2 ${
                          isFull ? "bg-slate-200 text-slate-400 cursor-not-allowed" : ""
                        }`}
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => {
            const isJoined = (club.members || []).includes(userEmail);

            return (
              <div
                key={club.id}
                className="m3-card p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {club.department} Dept
                    </span>
                    <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {club.membersCount || (club.members || []).length} Members
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900">{club.name}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                    {club.description}
                  </p>

                  <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-100 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Coordinator: <strong className="text-neutral-800">{club.coordinator}</strong></span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedClub(club)}
                    className="m3-button-tonal flex-1 text-xs py-2"
                  >
                    Announcements ({club.announcements?.length || 0})
                  </button>
                  {isJoined ? (
                    <span className="px-4 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 rounded-full">
                      Joined
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoinClub(club.id)}
                      className="m3-button-filled text-xs py-2"
                    >
                      Join Club
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
        >
          <div className="space-y-6">
            <div className="h-56 bg-slate-100 rounded-2xl overflow-hidden">
              <img
                src={selectedEvent.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60"}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedEvent.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Date & Time</span>
                <span className="font-bold text-slate-900">{selectedEvent.date} at {selectedEvent.time || "10:00 AM"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Venue</span>
                <span className="font-bold text-slate-900">{selectedEvent.venue}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Coordinator</span>
                <span className="font-bold text-slate-900">{selectedEvent.coordinator}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedEvent(null)}
                className="m3-button-tonal"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CLUB ANNOUNCEMENTS MODAL */}
      {selectedClub && (
        <Modal
          isOpen={!!selectedClub}
          onClose={() => setSelectedClub(null)}
          title={`${selectedClub.name} — Announcements`}
        >
          <div className="space-y-4">
            {(selectedClub.announcements || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No announcements published yet.</p>
            ) : (
              selectedClub.announcements.map(ann => (
                <div key={ann.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-slate-900">{ann.title}</h5>
                    <span className="text-[10px] text-slate-400 font-semibold">{ann.date}</span>
                  </div>
                  <p className="text-xs text-slate-600">{ann.content}</p>
                </div>
              ))
            )}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedClub(null)}
                className="m3-button-tonal"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CERTIFICATE MODAL */}
      {certificateModalEvent && (
        <Modal
          isOpen={!!certificateModalEvent}
          onClose={() => setCertificateModalEvent(null)}
          title="Official Certificate of Completion"
        >
          <div className="p-8 bg-gradient-to-br from-amber-50/60 via-white to-neutral-50 border-4 border-double border-amber-300 rounded-[28px] text-center space-y-4 shadow-sm">
            <Award className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="text-xl font-serif font-bold text-slate-900 tracking-wide uppercase">Certificate of Participation</h2>
            <p className="text-xs text-slate-600">This certifies that <strong className="text-neutral-900">{userEmail}</strong> participated in</p>
            <p className="text-sm font-extrabold text-slate-900">{certificateModalEvent.title}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
