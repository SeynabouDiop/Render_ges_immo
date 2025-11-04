const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id_bien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BienImmobilier',
    required: true
  },
  id_agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type_transaction: {
    type: String,
    enum: ['vente', 'location'],
    required: true
  },
  montant_total: {
    type: Number,
    required: true
  },
  commission_agent: Number,
  frais_agence: Number,
  date_transaction: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    enum: ['en_cours', 'finalisee', 'annulee'],
    default: 'en_cours'
  },
  notes: String,
  reference: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Index pour les recherches
transactionSchema.index({ id_bien: 1 });
transactionSchema.index({ id_agent: 1 });
transactionSchema.index({ type_transaction: 1 });
transactionSchema.index({ statut: 1 });

// Génération automatique de la référence avant sauvegarde
transactionSchema.pre('save', async function(next) {
  if (!this.reference) {
    const count = await mongoose.model('Transaction').countDocuments();
    const prefix = this.type_transaction === 'vente' ? 'VENT' : 'LOC';
    this.reference = `${prefix}-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);