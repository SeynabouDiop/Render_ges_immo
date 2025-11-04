const Client = require('../models/Client');
const User = require('../models/User');

// Get all clients (Admin only)
exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.find()
            .populate('id_utilisateur', 'nom prenom email telephone type_utilisateur statut')
            .sort({ date_creation: -1 });

        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get client by ID
exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findOne({ id_utilisateur: req.params.id })
            .populate('id_utilisateur', 'nom prenom email telephone type_utilisateur statut');

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé.' });
        }

        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create client
exports.createClient = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, type_client, adresse, code_postal, ville } = req.body;

        // Create user first
        const user = new User({
            nom,
            prenom,
            email,
            telephone,
            mot_de_passe: 'password123', // Default password
            type_utilisateur: 'locataire'
        });
        await user.save();

        // Create client
        const client = new Client({
            id_utilisateur: user._id,
            type_client,
            adresse,
            code_postal,
            ville
        });
        await client.save();

        const populatedClient = await Client.findById(client._id)
            .populate('id_utilisateur', 'nom prenom email telephone type_utilisateur statut');

        res.status(201).json(populatedClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update client
exports.updateClient = async (req, res) => {
    try {
        const client = await Client.findOne({ id_utilisateur: req.params.id });

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé.' });
        }

        // Update client data
        Object.assign(client, req.body);
        await client.save();

        // Update user data if provided
        if (req.body.nom || req.body.prenom || req.body.email || req.body.telephone) {
            await User.findByIdAndUpdate(client.id_utilisateur, {
                nom: req.body.nom,
                prenom: req.body.prenom,
                email: req.body.email,
                telephone: req.body.telephone
            });
        }

        const updatedClient = await Client.findOne({ id_utilisateur: req.params.id })
            .populate('id_utilisateur', 'nom prenom email telephone type_utilisateur statut');

        res.json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete client
exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findOne({ id_utilisateur: req.params.id });

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé.' });
        }

        // Delete user and client
        await User.findByIdAndDelete(client.id_utilisateur);
        await Client.findByIdAndDelete(client._id);

        res.json({ message: 'Client supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update client profile (for client users)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Update user data
        if (req.body.nom || req.body.prenom || req.body.email || req.body.telephone) {
            await User.findByIdAndUpdate(userId, {
                nom: req.body.nom,
                prenom: req.body.prenom,
                email: req.body.email,
                telephone: req.body.telephone
            });
        }

        // Update client data
        const clientData = { ...req.body };
        delete clientData.nom;
        delete clientData.prenom;
        delete clientData.email;
        delete clientData.telephone;

        await Client.findOneAndUpdate(
            { id_utilisateur: userId },
            clientData,
            { new: true, runValidators: true }
        );

        const updatedClient = await Client.findOne({ id_utilisateur: userId })
            .populate('id_utilisateur', 'nom prenom email telephone type_utilisateur statut');

        res.json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get client profile (for client users)
exports.getProfile = async (req, res) => {
    try {
        const client = await Client.findOne({ id_utilisateur: req.user.id })
            .populate('id_utilisateur', 'nom prenom email telephone type_utilisateur statut');

        if (!client) {
            return res.status(404).json({ message: 'Profil non trouvé.' });
        }

        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};