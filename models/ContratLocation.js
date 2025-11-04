const mongoose = require('mongoose');

const contratLocationSchema = new mongoose.Schema({
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
    required: true // en mois
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
  conditions_particulieres: {
    type: String,
    maxlength: 2000
  },
  date_creation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour les recherches
contratLocationSchema.index({ id_bien: 1 });
contratLocationSchema.index({ id_locataire: 1 });
contratLocationSchema.index({ id_agent: 1 });
contratLocationSchema.index({ numero_contrat: 1 });
contratLocationSchema.index({ statut: 1 });
contratLocationSchema.index({ date_debut: 1 });
contratLocationSchema.index({ date_fin: 1 });

// Méthode pour générer un numéro de contrat unique
contratLocationSchema.statics.generateContractNumber = async function() {
  const prefix = 'CONTRAT';
  const year = new Date().getFullYear();
  const count = await this.countDocuments({
    date_creation: {
      $gte: new Date(year, 0, 1),
      $lt: new Date(year + 1, 0, 1)
    }
  });
  
  return `${prefix}-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

module.exports = mongoose.model('ContratLocation', contratLocationSchema);