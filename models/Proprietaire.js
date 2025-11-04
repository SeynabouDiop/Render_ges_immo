const mongoose = require('mongoose');

const proprietaireSchema = new mongoose.Schema({
    id_utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    date_inscription: {
        type: Date,
        default: Date.now
    },
    specialite: {
        type: String,
        enum: ['residentiel', 'commercial', 'luxe', 'mixte'],
        default: 'residentiel'
    },
    experience: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        maxlength: 500
    },
    statut: {
        type: String,
        enum: ['actif', 'inactif', 'en_attente'],
        default: 'actif'
    }
}, {
    timestamps: true
});

// Index pour les recherches
proprietaireSchema.index({ id_utilisateur: 1 });
proprietaireSchema.index({ statut: 1 });

module.exports = mongoose.model('Proprietaire', proprietaireSchema);