const router = require('express').Router();
const { readDB, writeDB } = require('../data/database');

// GET all programs
router.route('/programs').get((req, res) => {
  const db = readDB();
  res.json(db.honoursMinors || []);
});

// POST add program (admin)
router.route('/programs/add').post((req, res) => {
  const db = readDB();
  db.honoursMinors = db.honoursMinors || [];
  const newProgram = {
    id: `hm_${Date.now()}`,
    title: req.body.title,
    type: req.body.type || 'Honours',
    offeringDepartment: req.body.offeringDepartment || 'CSE',
    eligibleDepartments: req.body.eligibleDepartments || ['CSE', 'IT'],
    minCGPA: parseFloat(req.body.minCGPA) || 7.5,
    totalCredits: parseInt(req.body.totalCredits) || 18,
    coreCredits: parseInt(req.body.coreCredits) || 12,
    projectCredits: parseInt(req.body.projectCredits) || 6,
    curriculum: req.body.curriculum || [],
    description: req.body.description || '',
    regulation: req.body.regulation || 'R2023',
    regulationsPdfUrl: '#',
    announcements: []
  };
  db.honoursMinors.push(newProgram);
  writeDB(db);
  res.json(newProgram);
});

// GET applications
router.route('/applications').get((req, res) => {
  const db = readDB();
  res.json(db.honoursMinorsApplications || []);
});

// POST submit application
router.route('/applications/submit').post((req, res) => {
  const db = readDB();
  db.honoursMinorsApplications = db.honoursMinorsApplications || [];

  const newApp = {
    id: `hma_${Date.now()}`,
    programId: req.body.programId,
    programTitle: req.body.programTitle,
    studentName: req.body.studentName || 'Student User',
    studentId: req.body.studentId || '22CS001',
    department: req.body.department || 'CSE',
    cgpa: parseFloat(req.body.cgpa) || 8.5,
    completedCredits: parseInt(req.body.completedCredits) || 80,
    status: 'Applied',
    dateSubmitted: new Date().toISOString()
  };

  db.honoursMinorsApplications.unshift(newApp);
  writeDB(db);
  res.json(newApp);
});

// POST update application status (admin)
router.route('/applications/update/:id').post((req, res) => {
  const db = readDB();
  db.honoursMinorsApplications = db.honoursMinorsApplications || [];
  const appIndex = db.honoursMinorsApplications.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) return res.status(404).json({ message: 'Application not found' });

  if (req.body.status) db.honoursMinorsApplications[appIndex].status = req.body.status;
  writeDB(db);
  res.json(db.honoursMinorsApplications[appIndex]);
});

module.exports = router;
