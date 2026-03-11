const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  details: { type: String, default: '' },
  weight: { type: Number, default: null }, // Logged weight along with the image
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
