const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entry');
const galleryRoutes = require('./routes/gallery');
const logRoutes = require('./routes/log');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/logs', logRoutes);

app.get('/', (req, res) => {
  res.send('Fitness Tracker API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
