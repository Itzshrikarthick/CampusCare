const router = require('express').Router();
const { readDB } = require('../data/database');

// Get cafeteria data
router.route('/').get((req, res) => {
  try {
    const db = readDB();
    res.json(db.cafeteria || []);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update cafeteria data
router.route('/update/:id').post((req, res) => {
  try {
    const db = readDB();
    const index = db.cafeteria.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      if (req.body.crowdStatus) db.cafeteria[index].crowdStatus = req.body.crowdStatus;
      if (req.body.menu) db.cafeteria[index].menu = req.body.menu;
      if (req.body.events !== undefined) db.cafeteria[index].events = req.body.events;
      db.cafeteria[index].updatedAt = new Date().toISOString();
      writeDB(db);
      res.json(db.cafeteria[index]);
    } else {
      res.status(404).json('Error: Cafeteria not found');
    }
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
