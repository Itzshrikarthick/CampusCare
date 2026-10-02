const router = require('express').Router();
const { readDB, writeDB } = require('../data/database');
const crypto = require('crypto');

// Get all emergencies
router.route('/').get((req, res) => {
  try {
    const db = readDB();
    const sorted = db.emergencies.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json(sorted);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Create a new emergency
router.route('/add').post((req, res) => {
  try {
    const db = readDB();
    const newEmergency = {
      id: crypto.randomUUID(),
      type: req.body.type,
      location: req.body.location,
      description: req.body.description,
      status: req.body.status || 'Reported',
      time: new Date().toISOString(),
      photos: req.body.photos || [],
      reportedBy: req.body.reportedBy || 'user'
    };
    db.emergencies.push(newEmergency);
    writeDB(db);
    res.json(newEmergency);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update emergency status
router.route('/update/:id').post((req, res) => {
  try {
    const db = readDB();
    const emergencyIndex = db.emergencies.findIndex(e => e.id === req.params.id);
    if (emergencyIndex !== -1) {
      if (req.body.status) db.emergencies[emergencyIndex].status = req.body.status;
      writeDB(db);
      res.json('Emergency updated!');
    } else {
      res.status(404).json('Error: Emergency not found');
    }
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Delete all emergencies
router.route('/clear').delete((req, res) => {
  try {
    const db = readDB();
    db.emergencies = [];
    writeDB(db);
    res.json('Emergencies cleared!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
