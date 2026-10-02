const router = require('express').Router();
const { readDB, writeDB } = require('../data/database');

router.route('/').get((req, res) => {
  const db = readDB();
  res.json(db.lostFound || []);
});

router.route('/add').post((req, res) => {
  const db = readDB();
  db.lostFound = db.lostFound || [];
  const newItem = {
    id: `lf_${Date.now()}`,
    title: req.body.title,
    type: req.body.type || 'Lost',
    category: req.body.category || 'General',
    description: req.body.description || '',
    date: req.body.date || new Date().toISOString().split('T')[0],
    location: req.body.location || 'Campus Ground',
    image: req.body.image || '',
    status: 'Open',
    claims: []
  };

  db.lostFound.unshift(newItem);
  writeDB(db);
  res.json(newItem);
});

// POST submit claim for item
router.route('/claim/:id').post((req, res) => {
  const db = readDB();
  db.lostFound = db.lostFound || [];
  const item = db.lostFound.find(l => l.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  item.claims = item.claims || [];
  const newClaim = {
    id: `claim_${Date.now()}`,
    studentName: req.body.studentName || 'Student',
    studentId: req.body.studentId || '22CS001',
    proofDescription: req.body.proofDescription || '',
    contactNumber: req.body.contactNumber || '',
    dateSubmitted: new Date().toISOString(),
    status: 'Pending',
    adminNotes: ''
  };

  item.claims.push(newClaim);
  item.status = 'Claim Requested';
  writeDB(db);
  res.json(item);
});

// POST update item or claim status (admin)
router.route('/update/:id').post((req, res) => {
  const db = readDB();
  db.lostFound = db.lostFound || [];
  const item = db.lostFound.find(l => l.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  if (req.body.status) item.status = req.body.status;
  if (req.body.claimId && req.body.claimStatus) {
    const claim = (item.claims || []).find(c => c.id === req.body.claimId);
    if (claim) {
      claim.status = req.body.claimStatus;
      if (req.body.adminNotes) claim.adminNotes = req.body.adminNotes;
      if (req.body.claimStatus === 'Approved') {
        item.status = 'Verified';
      }
    }
  }

  writeDB(db);
  res.json(item);
});

router.route('/delete/:id').delete((req, res) => {
  const db = readDB();
  db.lostFound = (db.lostFound || []).filter(l => l.id !== req.params.id);
  writeDB(db);
  res.json({ message: 'Item deleted' });
});

module.exports = router;
