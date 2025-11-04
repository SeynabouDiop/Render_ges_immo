const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    prenom: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    telephone: {
        type: String,
        trim: true
    },
    mot_de_passe: {
        type: String,
        required: true,
        minlength: 6
    },
    type_utilisateur: {
        type: String,
        enum: ['admin', 'agent', 'proprietaire', 'locataire'],
        required: true
    },
    date_creation: {
        type: Date,
        default: Date.now
    },
    date_modification: {
        type: Date,
        default: Date.now
    },
    statut: {
        type: String,
        enum: ['actif', 'inactif', 'suspendu'],
        default: 'actif'
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('mot_de_passe')) return next();

    this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, 12);
    next();
});

// Update date_modification on save
userSchema.pre('save', function (next) {
    this.date_modification = Date.now();
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.mot_de_passe);
};

module.exports = mongoose.model('User', userSchema);