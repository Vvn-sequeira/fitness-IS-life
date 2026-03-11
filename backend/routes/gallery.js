const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

// Get all images for user
router.get('/', auth, async (req, res) => {
  try {
    const images = await Gallery.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(images);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Upload a new image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const { weight, details, date } = req.body;
    const newImage = new Gallery({
      userId: req.user.id,
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
      weight: weight ? Number(weight) : null,
      details: details || '',
      date: date ? new Date(date) : new Date()
    });

    const savedImage = await newImage.save();
    res.json(savedImage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete an image
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ msg: 'Image not found' });

    // Ensure user owns image
    if (image.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Delete from cloudinary
    await cloudinary.uploader.destroy(image.cloudinaryId);
    
    // Delete from DB
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Image deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
