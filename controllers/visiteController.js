const Visite = require('../models/Visite');
const BienImmobilier = require('../models/BienImmobilier');
const User = require('../models/User');

// Créer une visite
exports.createVisite = async (req, res) => {
  try {
    const { id_bien, id_client, date_visite, duree_estimee, notes } = req.body;
    
    // Vérifier que le bien existe
    const bien = await BienImmobilier.findById(id_bien);
    if (!bien) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé.' });
    }

    // Vérifier que le client existe (si fourni)
    if (id_client) {
      const client = await User.findById(id_client);
      if (!client) {
        return res.status(404).json({ message: 'Client non trouvé.' });
      }
    }

    const visite = new Visite({
      id_bien,
      id_agent: req.user.id, // L'agent connecté
      id_client,
      date_visite,
      duree_estimee,
      notes
    });

    await visite.save();

    const visitePopulee = await Visite.findById(visite._id)
      .populate('id_bien', 'titre adresse ville')
      .populate('id_agent', 'nom prenom email')
      .populate('id_client', 'nom prenom email telephone');

    res.status(201).json(visitePopulee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir toutes les visites
exports.getAllVisites = async (req, res) => {
  try {
    const { statut, id_agent, id_bien, date_debut, date_fin } = req.query;
    
    let filter = {};
    
    if (statut) filter.statut = statut;
    if (id_agent) filter.id_agent = id_agent;
    if (id_bien) filter.id_bien = id_bien;
    
    // Filtre par date
    if (date_debut || date_fin) {
      filter.date_visite = {};
      if (date_debut) filter.date_visite.$gte = new Date(date_debut);
      if (date_fin) filter.date_visite.$lte = new Date(date_fin);
    }

    const visites = await Visite.find(filter)
      .populate('id_bien', 'titre adresse ville prix_location prix_vente')
      .populate('id_agent', 'nom prenom email telephone')
      .populate('id_client', 'nom prenom email telephone')
      .sort({ date_visite: 1 });

    res.json(visites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une visite par ID
exports.getVisiteById = async (req, res) => {
  try {
    const visite = await Visite.findById(req.params.id)
      .populate('id_bien', 'titre adresse ville surface_habitable nb_pieces photos')
      .populate('id_agent', 'nom prenom email telephone')
      .populate('id_client', 'nom prenom email telephone');

    if (!visite) {
      return res.status(404).json({ message: 'Visite non trouvée.' });
    }

    res.json(visite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une visite
exports.updateVisite = async (req, res) => {
  try {
    const { statut, notes, resultat } = req.body;

    const visite = await Visite.findByIdAndUpdate(
      req.params.id,
      { statut, notes, resultat },
      { new: true, runValidators: true }
    )
      .populate('id_bien', 'titre adresse ville')
      .populate('id_agent', 'nom prenom email')
      .populate('id_client', 'nom prenom email telephone');

    if (!visite) {
      return res.status(404).json({ message: 'Visite non trouvée.' });
    }

    res.json(visite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une visite
exports.deleteVisite = async (req, res) => {
  try {
    const visite = await Visite.findByIdAndDelete(req.params.id);

    if (!visite) {
      return res.status(404).json({ message: 'Visite non trouvée.' });
    }

    res.json({ message: 'Visite supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les visites d'un agent
exports.getVisitesByAgent = async (req, res) => {
  try {
    const visites = await Visite.find({ id_agent: req.params.agentId })
      .populate('id_bien', 'titre adresse ville')
      .populate('id_client', 'nom prenom email telephone')
      .sort({ date_visite: 1 });

    res.json(visites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les visites d'un bien
exports.getVisitesByBien = async (req, res) => {
  try {
    const visites = await Visite.find({ id_bien: req.params.bienId })
      .populate('id_agent', 'nom prenom email telephone')
      .populate('id_client', 'nom prenom email telephone')
      .sort({ date_visite: -1 });

    res.json(visites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};