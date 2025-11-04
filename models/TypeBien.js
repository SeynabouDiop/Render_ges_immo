const mongoose = require('mongoose');

const typeBienSchema = new mongoose.Schema({
  libelle: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true
  },
  date_creation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TypeBien', typeBienSchema);