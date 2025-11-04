const User = require('../models/User');
const BienImmobilier = require('../models/BienImmobilier');
const Contrat = require('../models/Contrat');

// Créer un agent
exports.createAgent = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, mot_de_passe } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
        }

        // Créer l'agent
        const agent = new User({
            nom,
            prenom,
            email,
            telephone,
            mot_de_passe: mot_de_passe || 'password123',
            type_utilisateur: 'agent'
        });

        await agent.save();

        // Retourner l'agent sans le mot de passe
        const agentResponse = await User.findById(agent._id).select('-mot_de_passe');
        
        res.status(201).json({
            message: 'Agent créé avec succès',
            agent: agentResponse
        });
    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'agent' });
    }
};

// Obtenir tous les agents
exports.getAllAgents = async (req, res) => {
    try {
        const agents = await User.find({ type_utilisateur: 'agent' })
            .select('-mot_de_passe')
            .sort({ date_creation: -1 });
        
        res.json(agents);
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Obtenir un agent par ID
exports.getAgentById = async (req, res) => {
    try {
        const agent = await User.findOne({ 
            _id: req.params.id, 
            type_utilisateur: 'agent' 
        }).select('-mot_de_passe');
        
        if (!agent) {
            return res.status(404).json({ message: 'Agent non trouvé' });
        }
        
        res.json(agent);
    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Mettre à jour un agent
exports.updateAgent = async (req, res) => {
    try {
        const { nom, prenom, email, telephone, statut } = req.body;

        const agent = await User.findOneAndUpdate(
            { 
                _id: req.params.id, 
                type_utilisateur: 'agent' 
            },
            { 
                nom, 
                prenom, 
                email, 
                telephone, 
                statut,
                date_modification: new Date()
            },
            { new: true, runValidators: true }
        ).select('-mot_de_passe');

        if (!agent) {
            return res.status(404).json({ message: 'Agent non trouvé' });
        }

        res.json({
            message: 'Agent modifié avec succès',
            agent
        });
    } catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({ message: 'Erreur lors de la modification de l\'agent' });
    }
};

// Supprimer un agent
exports.deleteAgent = async (req, res) => {
    try {
        const agent = await User.findOneAndDelete({ 
            _id: req.params.id, 
            type_utilisateur: 'agent' 
        });

        if (!agent) {
            return res.status(404).json({ message: 'Agent non trouvé' });
        }

        res.json({ message: 'Agent supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'agent' });
    }
};

// Obtenir les statistiques d'un agent
exports.getAgentStats = async (req, res) => {
    try {
        const agentId = req.user.id;

        // Compter les biens gérés par l'agent
        const totalBiens = await BienImmobilier.countDocuments({ 
            id_agent: agentId 
        });

        // Compter les contrats gérés par l'agent
        const totalContrats = await Contrat.countDocuments({ 
            id_agent: agentId 
        });

        // Contrats actifs
        const contratsActifs = await Contrat.countDocuments({ 
            id_agent: agentId,
            statut: 'actif'
        });

        res.json({
            totalBiens,
            totalContrats,
            contratsActifs,
            tauxOccupation: totalBiens > 0 ? Math.round((contratsActifs / totalBiens) * 100) : 0
        });
    } catch (error) {
        console.error('Error fetching agent stats:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
