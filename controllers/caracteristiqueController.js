const Caracteristique = require('../models/Caracteristique');
const BienCaracteristique = require('../models/BienCaracteristique');

// GET /api/caracteristiques - Liste toutes les caractéristiques
exports.getAllCaracteristiques = async (req, res) => {
  try {
    const { categorie, actif } = req.query;
    
    let filter = {};
    if (categorie) filter.categorie = categorie;
    if (actif !== undefined) filter.est_actif = actif === 'true';

    const caracteristiques = await Caracteristique.find(filter)
      .sort({ categorie: 1, libelle: 1 });

    res.json({
      success: true,
      data: caracteristiques,
      count: caracteristiques.length
    });
  } catch (error) {
    console.error('Error fetching caracteristiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des caractéristiques',
      error: error.message
    });
  }
};

// GET /api/caracteristiques/:id - Détail d'une caractéristique
exports.getCaracteristiqueById = async (req, res) => {
  try {
    const caracteristique = await Caracteristique.findById(req.params.id);
    
    if (!caracteristique) {
      return res.status(404).json({
        success: false,
        message: 'Caractéristique non trouvée'
      });
    }

    res.json({
      success: true,
      data: caracteristique
    });
  } catch (error) {
    console.error('Error fetching caracteristique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la caractéristique',
      error: error.message
    });
  }
};

// POST /api/caracteristiques - Créer une nouvelle caractéristique
exports.createCaracteristique = async (req, res) => {
  try {
    const { libelle, categorie, description, unite_mesure } = req.body;

    const existingCaracteristique = await Caracteristique.findOne({ 
           libelle: libelle.trim(),
      categorie libelle: libelle.trim 
    });

   (),
      categorie 
    });

    if (existingCar if (existingCaracteristique) {
      return res.status(400).json({
        success: false,
acteristique) {
      return res.status(400).json({
               message: 'Une caractérist success: false,
        messageique avec ce libellé existe déjà dans cette catégorie'
      });
    }

    const nouvelleCaracteristique = new Caracteristique({
      libelle: libelle.trim(),
      categorie,
      description,
      unite_mes: 'Une caractéristique avec ce libellé existe déjà dans cette catégorie'
      });
    }

    const nouvelleCaracteristique = new Caracteristique({
      libelleure
    });

    await nouvelleCaracteristique.save();

    res.status(201).json({
      success: true,
      message: 'Caractéristique créée avec succès',
      data: nouvelleCaracteristique
    });
  } catch (error) {
    console.error('Error creating caracter: libelle.trim(),
      categorie,
      description,
      unite_mesure
    });

    await nouvelleCaracteristique.save();

    res.status(201).json({
      success: true,
      message: 'Caractéristique créée avec succès',
      data: nouvelleCaracteristique
    });
  } catch (error) {
    console.error('Error creating caracteristique:', erroristique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la caractéristique',
      error: error.message
    });
  }
};

// GET /api/caracteristiques/categories - Liste des catégories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Caracteristique.distinct('categorie');
    
    res.json({
      success: true,
      data: categories
    });
  } catch);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la caractéristique',
      error: error.message
    });
  }
};

// GET /api/caracteristiques/categories - Liste des catégories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Caracteristique.distinct('categorie');
    
    res.json({
      success: true,
      data: categories (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
};
