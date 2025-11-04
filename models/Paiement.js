const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  id_contrat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contrat',
    required: true
  },
  mois_annee: {
    type: Date,
    required: true
  },
  montant_loyer: {
    type: Number,
    required: true
  },
  montant_charges: {
    type: Number,
    default: 0
  },
  date_paiement: Date,
  mode_paiement: {
    type: String,
    enum: ['cheque', 'virement', 'prelevement', 'especes'],
    required: true
  },
  reference_paiement: String,
  statut: {
    type: String,
    enum: ['paye', 'en_retard', 'impaye', 'partiel'],
    required: true
  },
  date_echeance: {
    type: Date,
    required: true
  },
  penalites_retard: {
    type: Number,
    default: 0
  },
  notes: String,
  fichier_quittance: String
}, {
  timestamps: true
});

// Index pour les recherches
paiementSchema.index({ id_contrat: 1 });
paiementSchema.index({ statut: 1 });
paiementSchema.index({ date_echeance: 1 });
paiementSchema.index({ mois_annee: 1 });

module.exports = mongoose.model('Paiement', paiementSchema);