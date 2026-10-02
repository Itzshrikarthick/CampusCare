const router = require('express').Router();
const { readDB, writeDB } = require('../data/database');

// GET all clubs
router.route('/').get((req, res) => {
  const db = readDB();
  res.json(db.clubs || []);
});

// POST add club
router.route('/add').post((req, res) => {
  const db = readDB();
  db.clubs = db.clubs || [];
  const newClub = {
    id: `club_${Date.now()}`,
    name: req.body.name,
    department: req.body.department || 'CSE',
    category: req.body.category || 'General',
    description: req.body.description || '',
    coordinator: req.body.coordinator || 'Faculty Coordinator',
    membersCount: 1,
    members: [req.body.createdBy || 'user@campuscare.edu'],
    announcements: []
  };
  db.clubs.push(newClub);
  writeDB(db);
  res.json(newClub);
});

// POST join club
router.route('/join/:id').post((req, res) => {
  const db = readDB();
  db.clubs = db.clubs || [];
  const club = db.clubs.find(c => c.id === req.params.id);
  if (!club) return res.status(404).json({ message: 'Club not found' });

  const studentEmail = req.body.studentEmail || 'student@campuscare.edu';
  if (!club.members.includes(studentEmail)) {
    club.members.push(studentEmail);
    club.membersCount = club.members.length;
  }
  writeDB(db);
  res.json(club);
});

// POST add club announcement
router.route('/announcement/add/:id').post((req, res) => {
  const db = readDB();
  db.clubs = db.clubs || [];
  const club = db.clubs.find(c => c.id === req.params.id);
  if (!club) return res.status(404).json({ message: 'Club not found' });

  club.announcements = club.announcements || [];
  const newAnn = {
    id: `ca_${Date.now()}`,
    title: req.body.title,
    content: req.body.content,
    date: new Date().toISOString().split('T')[0]
  };
  club.announcements.unshift(newAnn);
  writeDB(db);
  res.json(club);
});

module.exports = router;
