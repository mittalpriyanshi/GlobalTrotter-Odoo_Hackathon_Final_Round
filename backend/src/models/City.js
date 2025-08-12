const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: String,
  lat: Number,
  lon: Number,
  costIndex: Number,
  popularity: Number,
  aliases: [String],
  imageUrl: String
});
CitySchema.index({ name: 'text' });

module.exports = mongoose.model('City', CitySchema);


