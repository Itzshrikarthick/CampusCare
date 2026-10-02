const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Routes
const complaintsRouter = require('./routes/complaints');
const emergenciesRouter = require('./routes/emergencies');
const eventsRouter = require('./routes/events');
const lostFoundRouter = require('./routes/lostFound');
const facilitiesRouter = require('./routes/facilities');
const cafeteriaRouter = require('./routes/cafeteria');
const clubsRouter = require('./routes/clubs');
const honoursMinorsRouter = require('./routes/honoursMinors');
const syllabusRouter = require('./routes/syllabus');

app.use('/api/complaints', complaintsRouter);
app.use('/api/emergencies', emergenciesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/lostfound', lostFoundRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/cafeteria', cafeteriaRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/honours-minors', honoursMinorsRouter);
app.use('/api/syllabus', syllabusRouter);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    console.log('CampusCare 5-Module JSON database active.');
});
