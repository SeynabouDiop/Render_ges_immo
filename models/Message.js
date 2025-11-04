const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id_expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id_destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id_bien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BienImmobilier'
  },
  sujet: String,
  contenu: {
    type: String,
    required: true
  },
  lu: {
    type: Boolean,
    default: false
  },
  type_message: {
    type: String,
    enum: ['demande_info', 'visite', 'probleme', 'general', 'urgence'],
    default: 'general'
  },
  priorite: {
    type: String,
    enum: ['basse', 'normale', 'haute'],
    default: 'normale'
  },
  pieces_jointes: [String]
}, {
  timestamps: true
});

// Index pour les recherches
messageSchema.index({ id_expediteur: 1 });
messageSchema.index({ id_destinataire: 1 });
messageSchema.index({ id_bien: 1 });
messageSchema.index({ type_message: 1 });
messageSchema.index({ lu: 1 });

module.exports = mongoose.model('Message', messageSchema);