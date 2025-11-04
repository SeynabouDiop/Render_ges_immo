const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  id_bien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BienImmobilier'
  },
  id_contrat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contrat'
  },
  id_utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type_document: {
    type: String,
    enum: ['contrat', 'quittance', 'etat_lieux', 'photo', 'diagnostic', 'facture', 'autre'],
    required: true
  },
  nom_fichier: {
    type: String,
    required: true
  },
  chemin_fichier: {
    type: String,
    required: true
  },
  taille_fichier: Number,
  type_mime: String,
  description: String,
  tags: [String],
  est_public: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour les recherches
documentSchema.index({ id_bien: 1 });
documentSchema.index({ id_contrat: 1 });
documentSchema.index({ type_document: 1 });
documentSchema.index({ tags: 1 });

module.exports = mongoose.model('Document', documentSchema);