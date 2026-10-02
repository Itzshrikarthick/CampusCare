const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { mockData } from './mockData';

// COMPLAINTS API
export const fetchComplaints = async () => {
  try {
    const res = await fetch(`${API_URL}/complaints`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching complaints:', err);
    return mockData.complaints;
  }
};

export const createComplaint = async (data) => {
  try {
    const res = await fetch(`${API_URL}/complaints/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error creating complaint:', err);
    const newComplaint = {
      id: `comp_${Date.now()}`,
      status: 'Submitted',
      photos: data.photos || [],
      timeline: [{ id: `t_${Date.now()}`, status: 'Submitted', comment: 'Submitted.', author: 'Student', date: new Date().toISOString() }],
      rating: 0,
      reopenedCount: 0,
      createdAt: new Date().toISOString(),
      ...data
    };
    mockData.complaints.unshift(newComplaint);
    return newComplaint;
  }
};

export const updateComplaintStatus = async (id, payload) => {
  try {
    const res = await fetch(`${API_URL}/complaints/update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(typeof payload === 'string' ? { status: payload } : payload),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error updating complaint status:', err);
    const index = mockData.complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      if (typeof payload === 'string') {
        mockData.complaints[index].status = payload;
      } else {
        mockData.complaints[index] = { ...mockData.complaints[index], ...payload };
      }
      return mockData.complaints[index];
    }
    return null;
  }
};

export const addComplaintComment = async (id, comment, author = 'Student') => {
  try {
    const res = await fetch(`${API_URL}/complaints/comment/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment, author }),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error adding complaint comment:', err);
    const comp = mockData.complaints.find(c => c.id === id);
    if (comp) {
      comp.timeline = comp.timeline || [];
      comp.timeline.push({ id: `t_${Date.now()}`, status: comp.status, comment, author, date: new Date().toISOString() });
    }
    return comp;
  }
};

export const rateComplaintResolution = async (id, rating, ratingFeedback = '') => {
  try {
    const res = await fetch(`${API_URL}/complaints/rate/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, ratingFeedback }),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error rating complaint:', err);
    const comp = mockData.complaints.find(c => c.id === id);
    if (comp) {
      comp.rating = rating;
      comp.ratingFeedback = ratingFeedback;
    }
    return comp;
  }
};

export const reopenComplaint = async (id, reason = '') => {
  try {
    const res = await fetch(`${API_URL}/complaints/reopen/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error reopening complaint:', err);
    const comp = mockData.complaints.find(c => c.id === id);
    if (comp) {
      comp.status = 'In Progress';
      comp.reopenedCount = (comp.reopenedCount || 0) + 1;
      comp.timeline = comp.timeline || [];
      comp.timeline.push({
        id: `t_${Date.now()}`,
        status: 'In Progress',
        comment: `Complaint reopened by student. Reason: ${reason}`,
        author: 'Student',
        date: new Date().toISOString()
      });
    }
    return comp;
  }
};

export const clearAllComplaints = async () => {
  try {
    await fetch(`${API_URL}/complaints/clear`, { method: 'DELETE' });
  } catch (err) {
    console.error('Error clearing complaints:', err);
    mockData.complaints = [];
  }
};

// EMERGENCIES API
export const fetchEmergencies = async () => {
  try {
    const res = await fetch(`${API_URL}/emergencies`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching emergencies:', err);
    return mockData.emergencies;
  }
};

export const createEmergency = async (data) => {
  try {
    const res = await fetch(`${API_URL}/emergencies/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error creating emergency:', err);
    const newEmergency = { id: `emerg_${Date.now()}`, status: 'Reported', time: new Date().toISOString(), ...data };
    mockData.emergencies.unshift(newEmergency);
    return newEmergency;
  }
};

export const updateEmergencyStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_URL}/emergencies/update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error updating emergency status:', err);
    const index = mockData.emergencies.findIndex(e => e.id === id);
    if (index !== -1) mockData.emergencies[index].status = status;
    return mockData.emergencies[index];
  }
};

export const clearAllEmergencies = async () => {
  try {
    await fetch(`${API_URL}/emergencies/clear`, { method: 'DELETE' });
  } catch (err) {
    console.error('Error clearing emergencies:', err);
    mockData.emergencies = [];
  }
};

// MODULE 1 — EVENTS & CLUBS API
export const fetchEvents = async () => {
  try {
    const res = await fetch(`${API_URL}/events`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching events:', err);
    return mockData.events;
  }
};

export const createEvent = async (data) => {
  try {
    const res = await fetch(`${API_URL}/events/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error creating event:', err);
    const newEvent = { id: `event_${Date.now()}`, registeredCount: 0, registrations: [], ...data };
    mockData.events.unshift(newEvent);
    return newEvent;
  }
};

export const registerEvent = async (id, studentEmail = 'student@campuscare.edu') => {
  try {
    const res = await fetch(`${API_URL}/events/register/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentEmail })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error registering for event:', err);
    const index = mockData.events.findIndex(e => e.id === id);
    if (index !== -1) {
      mockData.events[index].registrations = mockData.events[index].registrations || [];
      if (!mockData.events[index].registrations.includes(studentEmail)) {
        mockData.events[index].registrations.push(studentEmail);
        mockData.events[index].registeredCount = mockData.events[index].registrations.length;
      }
      return mockData.events[index];
    }
    return null;
  }
};

export const cancelEventRegistration = async (id, studentEmail = 'student@campuscare.edu') => {
  try {
    const res = await fetch(`${API_URL}/events/cancel-registration/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentEmail })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error canceling event registration:', err);
    const index = mockData.events.findIndex(e => e.id === id);
    if (index !== -1) {
      mockData.events[index].registrations = (mockData.events[index].registrations || []).filter(e => e !== studentEmail);
      mockData.events[index].registeredCount = mockData.events[index].registrations.length;
      return mockData.events[index];
    }
    return null;
  }
};

export const rsvpEvent = async (id) => {
  return registerEvent(id);
};

export const deleteEvent = async (id) => {
  try {
    await fetch(`${API_URL}/events/delete/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Error deleting event:', err);
    mockData.events = mockData.events.filter(e => e.id !== id);
  }
};

export const fetchClubs = async () => {
  try {
    const res = await fetch(`${API_URL}/clubs`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching clubs:', err);
    return mockData.clubs;
  }
};

export const createClub = async (data) => {
  try {
    const res = await fetch(`${API_URL}/clubs/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error creating club:', err);
    const newClub = { id: `club_${Date.now()}`, membersCount: 1, members: ['user@campuscare.edu'], announcements: [], ...data };
    mockData.clubs.push(newClub);
    return newClub;
  }
};

export const joinClub = async (id, studentEmail = 'student@campuscare.edu') => {
  try {
    const res = await fetch(`${API_URL}/clubs/join/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentEmail })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error joining club:', err);
    const club = mockData.clubs.find(c => c.id === id);
    if (club) {
      club.members = club.members || [];
      if (!club.members.includes(studentEmail)) {
        club.members.push(studentEmail);
        club.membersCount = club.members.length;
      }
    }
    return club;
  }
};

export const addClubAnnouncement = async (id, title, content) => {
  try {
    const res = await fetch(`${API_URL}/clubs/announcement/add/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error adding club announcement:', err);
    const club = mockData.clubs.find(c => c.id === id);
    if (club) {
      club.announcements = club.announcements || [];
      club.announcements.unshift({ id: `ca_${Date.now()}`, title, content, date: new Date().toISOString().split('T')[0] });
    }
    return club;
  }
};

// MODULE 2 — LOST & FOUND API
export const fetchLostFound = async () => {
  try {
    const res = await fetch(`${API_URL}/lostfound`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching lost & found:', err);
    return mockData.lostFound;
  }
};

export const createLostFound = async (data) => {
  try {
    const res = await fetch(`${API_URL}/lostfound/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error creating lost/found item:', err);
    const newItem = { id: `lf_${Date.now()}`, status: 'Open', claims: [], date: new Date().toISOString().split('T')[0], ...data };
    mockData.lostFound.unshift(newItem);
    return newItem;
  }
};

export const submitItemClaim = async (id, claimData) => {
  try {
    const res = await fetch(`${API_URL}/lostfound/claim/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error submitting claim:', err);
    const item = mockData.lostFound.find(l => l.id === id);
    if (item) {
      item.claims = item.claims || [];
      item.claims.push({
        id: `claim_${Date.now()}`,
        dateSubmitted: new Date().toISOString(),
        status: 'Pending',
        adminNotes: '',
        ...claimData
      });
      item.status = 'Claim Requested';
    }
    return item;
  }
};

export const updateLostFoundStatus = async (id, payload) => {
  try {
    const res = await fetch(`${API_URL}/lostfound/update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(typeof payload === 'string' ? { status: payload } : payload),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error updating lost/found status:', err);
    const item = mockData.lostFound.find(l => l.id === id);
    if (item) {
      if (typeof payload === 'string') {
        item.status = payload;
      } else {
        if (payload.status) item.status = payload.status;
        if (payload.claimId && payload.claimStatus) {
          const claim = (item.claims || []).find(c => c.id === payload.claimId);
          if (claim) {
            claim.status = payload.claimStatus;
            if (payload.adminNotes) claim.adminNotes = payload.adminNotes;
            if (payload.claimStatus === 'Approved') item.status = 'Verified';
          }
        }
      }
    }
    return item;
  }
};

export const deleteLostFound = async (id) => {
  try {
    await fetch(`${API_URL}/lostfound/delete/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Error deleting lost & found item:', err);
    mockData.lostFound = mockData.lostFound.filter(l => l.id !== id);
  }
};

// MODULE 4 — HONOURS & MINORS API
export const fetchHonoursMinors = async () => {
  try {
    const res = await fetch(`${API_URL}/honours-minors/programs`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching honours & minors:', err);
    return mockData.honoursMinors;
  }
};

export const createHonoursMinor = async (data) => {
  try {
    const res = await fetch(`${API_URL}/honours-minors/programs/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error creating honours/minor program:', err);
    const newProg = { id: `hm_${Date.now()}`, announcements: [], ...data };
    mockData.honoursMinors.push(newProg);
    return newProg;
  }
};

export const fetchHMApplications = async () => {
  try {
    const res = await fetch(`${API_URL}/honours-minors/applications`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching HM applications:', err);
    return mockData.honoursMinorsApplications;
  }
};

export const submitHMApplication = async (data) => {
  try {
    const res = await fetch(`${API_URL}/honours-minors/applications/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error submitting application:', err);
    const newApp = { id: `hma_${Date.now()}`, status: 'Applied', dateSubmitted: new Date().toISOString(), ...data };
    mockData.honoursMinorsApplications.unshift(newApp);
    return newApp;
  }
};

export const updateHMApplicationStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_URL}/honours-minors/applications/update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error updating application status:', err);
    const app = mockData.honoursMinorsApplications.find(a => a.id === id);
    if (app) app.status = status;
    return app;
  }
};

// MODULE 5 — SYLLABUS API
export const fetchSyllabus = async () => {
  try {
    const res = await fetch(`${API_URL}/syllabus`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching syllabus:', err);
    return mockData.syllabus;
  }
};

export const createSyllabus = async (data) => {
  try {
    const res = await fetch(`${API_URL}/syllabus/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error creating syllabus:', err);
    const newItem = { id: `syl_${Date.now()}`, pdfUrl: '#', ...data };
    mockData.syllabus.push(newItem);
    return newItem;
  }
};

export const deleteSyllabus = async (id) => {
  try {
    await fetch(`${API_URL}/syllabus/delete/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Error deleting syllabus:', err);
    mockData.syllabus = mockData.syllabus.filter(s => s.id !== id);
  }
};

// FACILITIES API
export const fetchFacilities = async () => {
  try {
    const res = await fetch(`${API_URL}/facilities`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching facilities:', err);
    return mockData.facilities;
  }
};

export const bookFacility = async (id, timeSlot) => {
  try {
    const res = await fetch(`${API_URL}/facilities/book/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSlot })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error booking facility:', err);
    const fac = mockData.facilities.find(f => f.id === id);
    if (fac) {
      fac.bookings = fac.bookings || [];
      fac.bookings.push({ timeSlot, bookedBy: 'Demo User', date: new Date().toISOString() });
    }
    return fac;
  }
};

export const updateFacilityStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_URL}/facilities/update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error updating facility status:', err);
    const fac = mockData.facilities.find(f => f.id === id);
    if (fac) fac.status = status;
    return fac;
  }
};

export const clearFacilityBookings = async (id) => {
  try {
    const res = await fetch(`${API_URL}/facilities/clear-bookings/${id}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error clearing facility bookings:', err);
    const fac = mockData.facilities.find(f => f.id === id);
    if (fac) fac.bookings = [];
    return fac;
  }
};

// CAFETERIA API
export const fetchCafeteria = async () => {
  try {
    const res = await fetch(`${API_URL}/cafeteria`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error fetching cafeteria:', err);
    return mockData.cafeteria;
  }
};

export const updateCafeteriaData = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/cafeteria/update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Error updating cafeteria data:', err);
    const index = mockData.cafeteria.findIndex(c => c.id === id);
    if (index !== -1) {
      mockData.cafeteria[index] = { ...mockData.cafeteria[index], ...data };
      return mockData.cafeteria[index];
    }
    return null;
  }
};
