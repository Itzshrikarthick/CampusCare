const router = require('express').Router();
const { readDB, writeDB } = require('../data/database');

// GET all syllabus items
router.route('/').get((req, res) => {
  const db = readDB();
  res.json(db.syllabus || []);
});

// POST add syllabus item (admin)
router.route('/add').post((req, res) => {
  const db = readDB();
  db.syllabus = db.syllabus || [];
  const newItem = {
    id: `syl_${Date.now()}`,
    code: req.body.code,
    name: req.body.name,
    department: req.body.department || 'CSE',
    regulation: req.body.regulation || 'R2023',
    semester: parseInt(req.body.semester) || 1,
    credits: parseInt(req.body.credits) || 3,
    objectives: req.body.objectives || [],
    courseOutcomes: req.body.courseOutcomes || [],
    units: req.body.units || [],
    textbooks: req.body.textbooks || [],
    referenceBooks: req.body.referenceBooks || [],
    pdfUrl: '#'
  };
  db.syllabus.push(newItem);
  writeDB(db);
  res.json(newItem);
});

// POST delete syllabus (admin)
router.route('/delete/:id').delete((req, res) => {
  const db = readDB();
  db.syllabus = (db.syllabus || []).filter(s => s.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Syllabus deleted' });
});

module.exports = router;
