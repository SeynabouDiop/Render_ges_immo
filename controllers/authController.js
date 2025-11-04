const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const { JWT_SECRET } = require('../middleware/auth');

// Login Admin (seulement pour les admins)
exports.loginAdmin = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        console.log('🔐 Admin login attempt:', email);

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // Vérifier que c'est un admin
        if (user.type_utilisateur !== 'admin') {
            return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(mot_de_passe);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // Vérifier le statut
        if (user.statut !== 'actif') {
            return res.status(400).json({ message: 'Votre compte est désactivé.' });
        }

        // Générer le token
        const token = jwt.sign(
            { id: user._id, type: user.type_utilisateur },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Admin login successful:', email);

        res.json({
            message: 'Connexion administrateur réussie',
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                type_utilisateur: user.type_utilisateur,
                statut: user.statut
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion administrateur' });
    }
};

// Les autres fonctions restent les mêmes...
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, mot_de_passe, type_utilisateur } = req.body;

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
        }

        // Créer l'utilisateur
        const user = new User({
            nom,
            prenom,
            email,
            telephone,
            mot_de_passe,
            type_utilisateur
        });

        await user.save();

        // Si client, créer le profil client
        if (type_utilisateur === 'locataire' || type_utilisateur === 'proprietaire') {
            const client = new Client({
                id_utilisateur: user._id,
                type_client: 'particulier'
            });
            await client.save();
        }

        // Générer le token
        const token = jwt.sign(
            { id: user._id, type: user.type_utilisateur },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                type_utilisateur: user.type_utilisateur
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(mot_de_passe);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // Vérifier le statut
        if (user.statut !== 'actif') {
            return res.status(400).json({ message: 'Votre compte est désactivé.' });
        }

        // Générer le token
        const token = jwt.sign(
            { id: user._id, type: user.type_utilisateur },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                type_utilisateur: user.type_utilisateur
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-mot_de_passe');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};