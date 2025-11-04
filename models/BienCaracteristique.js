const mongoose = require('mongoose');

const bienCaracteristiqueSchema = new mongoose.Schema({
  id_bien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BienImmobilier',
    required: true
  },
  id_caracteristique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caracteristique',
    required: true
  },
  valeur: {
    type: String,
    maxlength: 255
  }
}, {
  timestamps: true
});

// Index composite pour la clé primaire
bienCaracteristiqueSchema.index({ id_bien: 1, id_caracteristique: 1 }, { unique: true });

module.exports = mongoose.model('BienCaracteristique', bienCaracteristiqueSchema);