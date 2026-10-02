const router = require('express').Router();
const { readDB, writeDB } = require('../data/database');

router.route('/').get((req, res) => {
  const db = readDB();
  res.json(db.events || []);
});

router.route('/add').post((req, res) => {
  const db = readDB();
  db.events = db.events || [];

  const newEvent = {
    id: `event_${Date.now()}`,
    title: req.body.title,
    department: req.body.department || 'CSE',
    clubId: req.body.clubId || '',
    clubName: req.body.clubName || '',
    category: req.body.category || 'Academic',
    description: req.body.description || '',
    venue: req.body.venue || 'Campus Auditorium',
    coordinator: req.body.coordinator || 'Faculty Lead',
    coordinatorContact: req.body.coordinatorContact || '',
    date: req.body.date || new Date().toISOString().split('T')[0],
    time: req.body.time || '10:00 AM',
    registrationDeadline: req.body.registrationDeadline || new Date(Date.now() + 86400000 * 7).toISOString(),
    maxParticipants: parseInt(req.body.maxParticipants) || 100,
    registeredCount: 0,
    registrations: [],
    eligibility: req.body.eligibility || 'Open to all students',
    image: req.body.image || '',
    isPast: false
  };

  db.events.unshift(newEvent);
  writeDB(db);
  res.json(newEvent);
});

router.route('/register/:id').post((req, res) => {
  const db = readDB();
  db.events = db.events || [];
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const studentEmail = req.body.studentEmail || 'student@campuscare.edu';
  event.registrations = event.registrations || [];

  if (!event.registrations.includes(studentEmail)) {
    event.registrations.push(studentEmail);
    event.registeredCount = event.registrations.length;
  }
  writeDB(db);
  res.json(event);
});

router.route('/cancel-registration/:id').post((req, res) => {
  const db = readDB();
  db.events = db.events || [];
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const studentEmail = req.body.studentEmail || 'student@campuscare.edu';
  event.registrations = (event.registrations || []).filter(e => e !== studentEmail);
  event.registeredCount = event.registrations.length;

  writeDB(db);
  res.json(event);
});

router.route('/rsvp/:id').post((req, res) => {
  const db = readDB();
  db.events = db.events || [];
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  event.registeredCount = (event.registeredCount || 0) + 1;
  writeDB(db);
  res.json(event);
});

router.route('/delete/:id').delete((req, res) => {
  const db = readDB();
  db.events = (db.events || []).filter(e => e.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Event deleted' });
});

module.exports = router;
