const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const auth = require('../middleware/auth');

// Get all entries for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add new entry
router.post('/', auth, async (req, res) => {
  const { type, title, status, date, timing, grams, reps, sets, isDirectLog } = req.body;
  try {
    const newEntry = new Entry({
      userId: req.user.id,
      type,
      title,
      timing: timing || '',
      grams: grams ? Number(grams) : null,
      reps: reps ? Number(reps) : null,
      sets: sets ? Number(sets) : null,
      status: status || false,
      isDirectLog: isDirectLog !== undefined ? isDirectLog : false,
      date: date ? new Date(date) : Date.now()
    });

    const entry = await newEntry.save();
    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update entry
router.put('/:id', auth, async (req, res) => {
  const { title, status, type, timing, grams, reps, sets } = req.body;
  const entryFields = {};
  if (title) entryFields.title = title;
  if (status !== undefined) entryFields.status = status;
  if (type) entryFields.type = type;
  if (timing !== undefined) entryFields.timing = timing;
  if (grams !== undefined) entryFields.grams = grams;
  if (reps !== undefined) entryFields.reps = reps;
  if (sets !== undefined) entryFields.sets = sets;

  try {
    let entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });

    // Make sure user owns entry
    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    entry = await Entry.findByIdAndUpdate(
      req.params.id,
      { $set: entryFields },
      { new: true }
    );
    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ msg: 'Entry not found' });

    if (entry.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Entry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
