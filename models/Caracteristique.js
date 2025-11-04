const mongoose = require('mongoose');

const caracteristiqueSchema = new mongoose.Schema({
  libelle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  categorie: {
    type: String,
    enum: ['interieur', 'exterieur', 'securite', 'energie', 'confort'],
    required: true
  },
  date_creation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour les recherches
caracteristiqueSchema.index({ categorie: 1 });
caracteristiqueSchema.index({ libelle: 1 });

module.exports = mongoose.model('Caracteristique', caracteristiqueSchema);