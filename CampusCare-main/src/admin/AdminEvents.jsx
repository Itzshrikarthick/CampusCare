import React, { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, MapPin, Users, Sparkles, Megaphone } from "lucide-react";
import { fetchEvents, createEvent, deleteEvent, fetchClubs, createClub, addClubAnnouncement } from "../api.js";
import Toast from "../components/Toast.jsx";
import Modal from "../components/Modal.jsx";

const DEPARTMENTS = ["CSE", "IT", "AI&DS", "AIML", "ECE", "EEE", "Mechanical", "Civil"];
const CATEGORIES = ["Academic", "Technical", "Sports", "Cultural", "Workshop"];

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");

  const [toast, setToast] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [announcementModalClub, setAnnouncementModalClub] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: "",
    department: "CSE",
    category: "Academic",
    eventScope: "Internal",
    hostCollege: "CampusCare Main Campus",
    description: "",
    venue: "Campus Main Auditorium",
    coordinator: "Faculty Coordinator",
    coordinatorContact: "",
    date: "",
    time: "10:00 AM",
    registrationDeadline: "",
    maxParticipants: 100,
    eligibility: "Open to all students",
    image: ""
  });

  const [clubForm, setClubForm] = useState({
    name: "",
    department: "CSE",
    category: "Technical",
    description: "",
    coordinator: "Faculty Coordinator"
  });

  const [annForm, setAnnForm] = useState({ title: "", content: "" });

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchEvents(), fetchClubs()]).then(([eData, cData]) => {
      if (isMounted) {
        setEvents(eData || []);
        setClubs(cData || []);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) {
      showToast("error", "Please enter event title and date.");
      return;
    }

    const created = await createEvent(eventForm);
    if (created) {
      setEvents([created, ...events]);
      setIsEventModalOpen(false);
      setEventForm({
        title: "",
        department: "CSE",
        category: "Academic",
        description: "",
        venue: "Campus Main Auditorium",
        coordinator: "Faculty Coordinator",
        coordinatorContact: "",
        date: "",
        time: "10:00 AM",
        registrationDeadline: "",
        maxParticipants: 100,
        eligibility: "Open to all students",
        image: ""
      });
      showToast("success", "Department event created successfully!");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
      showToast("info", "Event deleted.");
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!clubForm.name) return;
    const created = await createClub(clubForm);
    if (created) {
      setClubs([...clubs, created]);
      setIsClubModalOpen(false);
      setClubForm({ name: "", department: "CSE", category: "Technical", description: "", coordinator: "Faculty Coordinator" });
      showToast("success", "New student club created!");
    }
  };

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content || !announcementModalClub) return;
    const updated = await addClubAnnouncement(announcementModalClub.id, annForm.title, annForm.content);
    if (updated) {
      setClubs(clubs.map(c => (c.id === announcementModalClub.id ? updated : c)));
      setAnnouncementModalClub(null);
      setAnnForm({ title: "", content: "" });
      showToast("success", "Club announcement published!");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-neutral-900" />
            Events & Clubs Admin Portal
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Create department events, set registration limits, manage clubs, and publish announcements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <div className="flex bg-neutral-200/60 p-1.5 rounded-full border border-neutral-300/60">
            <button
              onClick={() => setActiveTab("events")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "events" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab("clubs")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === "clubs" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Clubs ({clubs.length})
            </button>
          </div>

          {activeTab === "events" ? (
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="m3-button-filled"
            >
              <Plus className="w-4 h-4" /> Create Event
            </button>
          ) : (
            <button
              onClick={() => setIsClubModalOpen(true)}
              className="m3-button-filled"
            >
              <Plus className="w-4 h-4" /> Create Club
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-400">Loading events data...</div>
      ) : activeTab === "events" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                  {event.department} Dept
                </span>
                <span className="text-xs text-neutral-400 font-medium">{event.category}</span>
              </div>

              <h3 className="font-bold text-neutral-900 text-lg">{event.title}</h3>
              <p className="text-xs text-neutral-500 line-clamp-2">{event.description}</p>

              <div className="text-xs text-neutral-600 space-y-1.5 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{event.registeredCount || 0} / {event.maxParticipants || 100} Registered</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-neutral-100">
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map(club => (
            <div key={club.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
                  {club.department} Dept
                </span>
                <span className="text-xs text-neutral-500">{club.membersCount || 0} Members</span>
              </div>
              <h3 className="font-bold text-neutral-900 text-lg">{club.name}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{club.description}</p>
              <div className="text-xs text-neutral-500 border-t border-neutral-100 pt-2">
                Coordinator: <strong className="text-neutral-700">{club.coordinator}</strong>
              </div>

              <button
                onClick={() => setAnnouncementModalClub(club)}
                className="w-full py-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" /> Publish Announcement
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Create Department Event">
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. AI & Cloud Hackathon 2026"
              value={eventForm.title}
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Event Scope</label>
              <select
                value={eventForm.eventScope}
                onChange={e => setEventForm({ ...eventForm, eventScope: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm font-bold text-indigo-700"
              >
                <option value="Internal">Internal Campus</option>
                <option value="Inter-College">🌐 Inter-College (Outer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Department</label>
              <select
                value={eventForm.department}
                onChange={e => setEventForm({ ...eventForm, department: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
              <select
                value={eventForm.category}
                onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Time</label>
              <input
                type="text"
                placeholder="10:00 AM"
                value={eventForm.time}
                onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Max Participants</label>
              <input
                type="number"
                value={eventForm.maxParticipants}
                onChange={e => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Venue</label>
              <input
                type="text"
                value={eventForm.venue}
                onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Coordinator Name</label>
            <input
              type="text"
              value={eventForm.coordinator}
              onChange={e => setEventForm({ ...eventForm, coordinator: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Provide details about the event agenda, prizes, etc."
              value={eventForm.description}
              onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={eventForm.image}
              onChange={e => setEventForm({ ...eventForm, image: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Create Event
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE CLUB MODAL */}
      <Modal isOpen={isClubModalOpen} onClose={() => setIsClubModalOpen(false)} title="Create Student Club">
        <form onSubmit={handleCreateClub} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Club Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Coding & AI Society"
              value={clubForm.name}
              onChange={e => setClubForm({ ...clubForm, name: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Department</label>
              <select
                value={clubForm.department}
                onChange={e => setClubForm({ ...clubForm, department: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Faculty Coordinator</label>
              <input
                type="text"
                value={clubForm.coordinator}
                onChange={e => setClubForm({ ...clubForm, coordinator: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={clubForm.description}
              onChange={e => setClubForm({ ...clubForm, description: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsClubModalOpen(false)}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Create Club
            </button>
          </div>
        </form>
      </Modal>

      {/* ANNOUNCEMENT MODAL */}
      {announcementModalClub && (
        <Modal
          isOpen={!!announcementModalClub}
          onClose={() => setAnnouncementModalClub(null)}
          title={`Publish Announcement — ${announcementModalClub.name}`}
        >
          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Weekly LeetCode Sprint Announcement"
                value={annForm.title}
                onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Content *</label>
              <textarea
                rows={4}
                required
                placeholder="Write the announcement text here..."
                value={annForm.content}
                onChange={e => setAnnForm({ ...annForm, content: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setAnnouncementModalClub(null)}
                className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Publish
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
