const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  id_utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  numero_licence: {
    type: String,
    unique: true,
    sparse: true
  },
  specialite: {
    type: String,
    enum: ['residential', 'commercial', 'luxe', 'location'],
    required: true
  },
  taux_commission: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 100
  },
  date_embauche: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'congé'],
    default: 'actif'
  }
}, {
  timestamps: true
});

// Index pour les recherches
agentSchema.index({ id_utilisateur: 1 });
agentSchema.index({ specialite: 1 });
agentSchema.index({ statut: 1 });

module.exports = mongoose.model('Agent', agentSchema);
