const router = require('express').Router();
const { readDB, writeDB } = require('../data/database');

// Get all facilities
router.route('/').get((req, res) => {
  try {
    const db = readDB();
    res.json(db.facilities || []);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Book a facility
router.route('/book/:id').post((req, res) => {
  try {
    const db = readDB();
    const index = db.facilities.findIndex(f => f.id === req.params.id);
    if (index !== -1) {
      db.facilities[index].status = "Booked";
      db.facilities[index].bookings.push({
          timeSlot: req.body.timeSlot,
          bookedBy: req.body.bookedBy || "Student",
          date: new Date().toISOString()
      });
      writeDB(db);
      res.json(db.facilities[index]);
    } else {
      res.status(404).json('Error: Facility not found');
    }
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update facility status
router.route('/update/:id').post((req, res) => {
  try {
    const db = readDB();
    const index = db.facilities.findIndex(f => f.id === req.params.id);
    if (index !== -1) {
      if (req.body.status) db.facilities[index].status = req.body.status;
      writeDB(db);
      res.json(db.facilities[index]);
    } else {
      res.status(404).json('Error: Facility not found');
    }
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Clear facility bookings
router.route('/clear-bookings/:id').post((req, res) => {
  try {
    const db = readDB();
    const index = db.facilities.findIndex(f => f.id === req.params.id);
    if (index !== -1) {
      db.facilities[index].bookings = [];
      db.facilities[index].status = "Available";
      writeDB(db);
      res.json(db.facilities[index]);
    } else {
      res.status(404).json('Error: Facility not found');
    }
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
