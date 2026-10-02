const router = require('express').Router();
const { readDB, writeDB } = require('../data/database');

router.route('/').get((req, res) => {
  const db = readDB();
  res.json(db.complaints || []);
});

router.route('/add').post((req, res) => {
  const db = readDB();
  db.complaints = db.complaints || [];

  const newComplaint = {
    id: `comp_${Date.now()}`,
    title: req.body.title,
    category: req.body.category || 'Maintenance',
    priority: req.body.priority || 'Medium',
    location: req.body.location || 'Campus',
    description: req.body.description || '',
    status: 'Submitted',
    photos: req.body.photos || [],
    assignedTo: '',
    eta: '',
    adminRemarks: '',
    rating: 0,
    ratingFeedback: '',
    reopenedCount: 0,
    timeline: [
      { id: `t_${Date.now()}`, status: 'Submitted', comment: 'Complaint submitted by student.', author: 'Student', date: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  };

  db.complaints.unshift(newComplaint);
  writeDB(db);
  res.json(newComplaint);
});

// POST update complaint (status, assignment, remarks, ETA)
router.route('/update/:id').post((req, res) => {
  const db = readDB();
  db.complaints = db.complaints || [];
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  if (req.body.status) complaint.status = req.body.status;
  if (req.body.assignedTo !== undefined) complaint.assignedTo = req.body.assignedTo;
  if (req.body.eta !== undefined) complaint.eta = req.body.eta;
  if (req.body.adminRemarks !== undefined) complaint.adminRemarks = req.body.adminRemarks;

  if (req.body.comment) {
    complaint.timeline = complaint.timeline || [];
    complaint.timeline.push({
      id: `t_${Date.now()}`,
      status: complaint.status,
      comment: req.body.comment,
      author: req.body.author || 'Admin',
      date: new Date().toISOString()
    });
  }

  writeDB(db);
  res.json(complaint);
});

// POST add comment (student/admin)
router.route('/comment/:id').post((req, res) => {
  const db = readDB();
  db.complaints = db.complaints || [];
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  complaint.timeline = complaint.timeline || [];
  complaint.timeline.push({
    id: `t_${Date.now()}`,
    status: complaint.status,
    comment: req.body.comment,
    author: req.body.author || 'Student',
    date: new Date().toISOString()
  });

  writeDB(db);
  res.json(complaint);
});

// POST rate resolution
router.route('/rate/:id').post((req, res) => {
  const db = readDB();
  db.complaints = db.complaints || [];
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  complaint.rating = parseInt(req.body.rating) || 5;
  complaint.ratingFeedback = req.body.ratingFeedback || '';
  writeDB(db);
  res.json(complaint);
});

// POST reopen complaint
router.route('/reopen/:id').post((req, res) => {
  const db = readDB();
  db.complaints = db.complaints || [];
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

  complaint.status = 'In Progress';
  complaint.reopenedCount = (complaint.reopenedCount || 0) + 1;
  complaint.timeline = complaint.timeline || [];
  complaint.timeline.push({
    id: `t_${Date.now()}`,
    status: 'In Progress',
    comment: `Complaint reopened by student. Reason: ${req.body.reason || 'Issue still persists.'}`,
    author: 'Student',
    date: new Date().toISOString()
  });

  writeDB(db);
  res.json(complaint);
});

router.route('/clear').delete((req, res) => {
  const db = readDB();
  db.complaints = [];
  writeDB(db);
  res.json({ message: 'All complaints cleared' });
});

module.exports = router;
