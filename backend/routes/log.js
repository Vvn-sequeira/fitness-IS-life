const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all logs for a user
router.get('/', auth, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new log
router.post('/', auth, async (req, res) => {
  const { weight, date, notes } = req.body;

  try {
    const newLog = new Log({
      userId: req.user.id,
      weight,
      date: date ? new Date(date) : Date.now(),
      notes
    });

    const l = await newLog.save();

    // Update the user's current weight
    await User.findByIdAndUpdate(req.user.id, { $set: { currentWeight: weight } });

    res.json(l);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a log
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ msg: 'Log not found' });

    // Check user
    if (log.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Log.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Log deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
