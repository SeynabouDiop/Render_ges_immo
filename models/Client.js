const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    id_utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type_client: {
        type: String,
        enum: ['particulier', 'societe', 'investisseur'],
        default: 'particulier'
    },
    raison_sociale: {
        type: String,
        trim: true
    },
    siret: {
        type: String,
        trim: true
    },
    adresse: {
        type: String,
        trim: true
    },
    code_postal: {
        type: String,
        trim: true
    },
    ville: {
        type: String,
        trim: true
    },
    pays: {
        type: String,
        default: 'France'
    },
    date_creation: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Client', clientSchema);