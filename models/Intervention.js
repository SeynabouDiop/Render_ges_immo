const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  id_bien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BienImmobilier',
    required: true
  },
  id_demandeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type_intervention: {
    type: String,
    enum: ['reparation', 'entretien', 'urgence', 'amelioration'],
    required: true
  },
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priorite: {
    type: String,
    enum: ['basse', 'normale', 'haute', 'urgence'],
    default: 'normale'
  },
  statut: {
    type: String,
    enum: ['demande', 'planifiee', 'en_cours', 'terminee', 'annulee'],
    default: 'demande'
  },
  date_intervention: Date,
  date_fin_estimee: Date,
  cout_estime: Number,
  cout_reel: Number,
  prestataire: String,
  contact_prestataire: String,
  notes: String,
  pieces_jointes: [String]
}, {
  timestamps: true
});

// Index pour les recherches
interventionSchema.index({ id_bien: 1 });
interventionSchema.index({ id_demandeur: 1 });
interventionSchema.index({ statut: 1 });
interventionSchema.index({ priorite: 1 });

module.exports = mongoose.model('Intervention', interventionSchema);