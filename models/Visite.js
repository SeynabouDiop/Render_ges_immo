const mongoose = require('mongoose');

const visiteSchema = new mongoose.Schema({
  id_bien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BienImmobilier',
    required: true
  },
  id_agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id_client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date_visite: {
    type: Date,
    required: true
  },
  duree_estimee: {
    type: Number,
    default: 60 // en minutes
  },
  statut: {
    type: String,
    enum: ['planifiee', 'confirmee', 'terminee', 'annulee'],
    default: 'planifiee'
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  resultat: {
    type: String,
    enum: ['interesse', 'non_interesse', 'a_revoir']
  },
  date_creation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour les recherches
visiteSchema.index({ id_bien: 1 });
visiteSchema.index({ id_agent: 1 });
visiteSchema.index({ id_client: 1 });
visiteSchema.index({ date_visite: 1 });
visiteSchema.index({ statut: 1 });

module.exports = mongoose.model('Visite', visiteSchema);