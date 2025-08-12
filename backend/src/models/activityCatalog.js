const mongoose = require('mongoose');

const ActivityCatalogSchema = new mongoose.Schema({
  name: String,
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  category: String,
  avgCost: Number,
  durationMinutes: Number,
  description: String,
  images: [String],
  tags: [String]
});

module.exports = mongoose.model('ActivityCatalog', ActivityCatalogSchema);