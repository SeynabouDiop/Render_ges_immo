const ContratLocation = require('../models/ContratLocation');
const BienImmobilier = require('../models/BienImmobilier');
const User = require('../models/User');

// Créer un contrat de location
exports.createContrat = async (req, res) => {
  try {
    const {
      id_bien,
      id_locataire,
      date_debut,
      date_fin,
      duree_bail,
      loyer_mensuel,
      charges_mensuelles,
      depot_garantie,
      index_depart,
      date_etat_lieux,
      conditions_particulieres
    } = req.body;

    // Vérifier que le bien existe
    const bien = await BienImmobilier.findById(id_bien);
    if (!bien) {
      return res.status(404).json({ message: 'Bien immobilier non trouvé.' });
    }

    // Vérifier que le locataire existe
    const locataire = await User.findById(id_locataire);
    if (!locataire) {
      return res.status(404).json({ message: 'Locataire non trouvé.' });
    }

    // Vérifier que le bien est disponible
    if (bien.statut !== 'disponible') {
      return res.status(400).json({ message: 'Le bien n\'est pas disponible pour la location.' });
    }

    // Générer le numéro de contrat
    const numero_contrat = await ContratLocation.generateContractNumber();

    const contrat = new ContratLocation({
      id_bien,
      id_locataire,
      id_agent: req.user.id, // L'agent connecté
      numero_contrat,
      date_debut,
      date_fin,
      duree_bail,
      loyer_mensuel,
      charges_mensuelles,
      depot_garantie,
      index_depart,
      date_etat_lieux,
      conditions_particulieres
    });

    await contrat.save();

    // Mettre à jour le statut du bien
    await BienImmobilier.findByIdAndUpdate(id_bien, { statut: 'loue' });

    const contratPopule = await ContratLocation.findById(contrat._id)
      .populate('id_bien', 'titre adresse ville surface_habitable')
      .populate('id_locataire', 'nom prenom email telephone')
      .populate('id_agent', 'nom prenom email');

    res.status(201).json(contratPopule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir tous les contrats
exports.getAllContrats = async (req, res) => {
  try {
    const { statut, id_locataire, id_bien, id_agent } = req.query;
    
    let filter = {};
    
    if (statut) filter.statut = statut;
    if (id_locataire) filter.id_locataire = id_locataire;
    if (id_bien) filter.id_bien = id_bien;
    if (id_agent) filter.id_agent = id_agent;

    const contrats = await ContratLocation.find(filter)
      .populate('id_bien', 'titre adresse ville surface_habitable')
      .populate('id_locataire', 'nom prenom email telephone')
      .populate('id_agent', 'nom prenom email')
      .sort({ date_debut: -1 });

    res.json(contrats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un contrat par ID
exports.getContratById = async (req, res) => {
  try {
    const contrat = await ContratLocation.findById(req.params.id)
      .populate('id_bien', 'titre adresse ville surface_habitable nb_pieces description')
      .populate('id_locataire', 'nom prenom email telephone')
      .populate('id_agent', 'nom prenom email telephone');

    if (!contrat) {
      return res.status(404).json({ message: 'Contrat non trouvé.' });
    }

    res.json(contrat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un contrat
exports.updateContrat = async (req, res) => {
  try {
    const {
      date_fin,
      loyer_mensuel,
      charges_mensuelles,
      statut,
      conditions_particulieres
    } = req.body;

    const contrat = await ContratLocation.findByIdAndUpdate(
      req.params.id,
      {
        date_fin,
        loyer_mensuel,
        charges_mensuelles,
        statut,
        conditions_particulieres
      },
      { new: true, runValidators: true }
    )
      .populate('id_bien', 'titre adresse ville')
      .populate('id_locataire', 'nom prenom email telephone')
      .populate('id_agent', 'nom prenom email');

    if (!contrat) {
      return res.status(404).json({ message: 'Contrat non trouvé.' });
    }

    // Si le contrat est résilié ou terminé, remettre le bien en disponible
    if (statut === 'resilie' || statut === 'termine') {
      await BienImmobilier.findByIdAndUpdate(contrat.id_bien, { statut: 'disponible' });
    }

    res.json(contrat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un contrat
exports.deleteContrat = async (req, res) => {
  try {
    const contrat = await ContratLocation.findByIdAndDelete(req.params.id);

    if (!contrat) {
      return res.status(404).json({ message: 'Contrat non trouvé.' });
    }

    // Remettre le bien en disponible
    await BienImmobilier.findByIdAndUpdate(contrat.id_bien, { statut: 'disponible' });

    res.json({ message: 'Contrat supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les contrats d'un locataire
exports.getContratsByLocataire = async (req, res) => {
  try {
    const contrats = await ContratLocation.find({ id_locataire: req.params.locataireId })
      .populate('id_bien', 'titre adresse ville surface_habitable')
      .populate('id_agent', 'nom prenom email')
      .sort({ date_debut: -1 });

    res.json(contrats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les contrats d'un bien
exports.getContratsByBien = async (req, res) => {
  try {
    const contrats = await ContratLocation.find({ id_bien: req.params.bienId })
      .populate('id_locataire', 'nom prenom email telephone')
      .populate('id_agent', 'nom prenom email')
      .sort({ date_debut: -1 });

    res.json(contrats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir les contrats expirant bientôt
exports.getContratsExpirant = async (req, res) => {
  try {
    const jours = parseInt(req.query.jours) || 30;
    const dateLimite = new Date();
    dateLimite.setDate(dateLimite.getDate() + jours);

    const contrats = await ContratLocation.find({
      statut: 'actif',
      date_fin: {
        $lte: dateLimite,
        $gte: new Date()
      }
    })
      .populate('id_bien', 'titre adresse ville')
      .populate('id_locataire', 'nom prenom email telephone')
      .sort({ date_fin: 1 });

    res.json(contrats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};