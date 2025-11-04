const mongoose = require('mongoose');

const contratSchema = new mongoose.Schema({
  id_bien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BienImmobilier',
    required: true
  },
  id_locataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id_agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  numero_contrat: {
    type: String,
    required: true,
    unique: true
  },
  date_debut: {
    type: Date,
    required: true
  },
  date_fin: Date,
  duree_bail: {
    type: Number,
    required: true
  },
  loyer_mensuel: {
    type: Number,
    required: true
  },
  charges_mensuelles: {
    type: Number,
    default: 0
  },
  depot_garantie: {
    type: Number,
    required: true
  },
  index_depart: Number,
  date_etat_lieux: Date,
  statut: {
    type: String,
    enum: ['actif', 'resilie', 'termine'],
    default: 'actif'
  },
  conditions_particulieres: String,
  date_creation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour les recherches
contratSchema.index({ id_bien: 1 });
contratSchema.index({ id_locataire: 1 });
contratSchema.index({ statut: 1 });
contratSchema.index({ date_debut: 1 });
contratSchema.index({ date_fin: 1 });

module.exports = mongoose.model('Contrat', contratSchema);
