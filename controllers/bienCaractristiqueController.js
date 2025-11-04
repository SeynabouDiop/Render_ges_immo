const BienCaracteristique = require('../models/BienCaracteristique');
const Caracteristique = require('../models/Caracteristique');

// GET /api/caracteristiques/biens/:id/caracteristiques - Caractéristiques d'un bien
exports.getCaracteristiquesByBien = async (req, res) => {
  try {
    const caracteristiques = await BienCaracteristique.find({ 
      id_bien: req.params.id 
    })
    .populate('id_caracteristique')
    .sort({ 'id_caracteristique.categorie': 1, 'id_caracteristique.libelle': 1 });

    res.json({
      success: true,
      data: caracteristiques,
      count: caracteristiques.length
    });
  } catch (error) {
    console.error('Error fetching bien caracteristiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des caractéristiques du bien',
      error: error.message
    });
  }
};

// POST /api/caracteristiques/biens/:id/caracteristiques - Ajouter/modifier caractéristique à un bien
exports.addCaracteristiqueToBien = async (req, res) => {
  try {
    const { id_caracteristique, valeur } = req.body;
    const id_bien = req.params.id;

    // Vérifier si la caractéristique existe
    const caracteristique = await Caracteristique.findById(id_caracteristique);
    if (!caracteristique) {
      return res.status(404).json({
        success: false,
        message: 'Caractéristique non trouvée'
      });
    }

    // Vérifier si l'association existe déjà
    const existingAssociation = await BienCaracteristique.findOne({
      id_bien,
      id_caracteristique
    });

    let bienCaracteristique;

    if (existingAssociation) {
      // Mettre à jour la valeur existante
      bienCaracteristique = await BienCaracteristique.findByIdAndUpdate(
        existingAssociation._id,
        { valeur: valeur.trim() },
        { new: true }
      ).populate('id_caracteristique');
    } else {
      // Créer une nouvelle association
      bienCaracteristique = new BienCaracteristique({
        id_bien,
        id_caracteristique,
        valeur: valeur.trim()
      });
      await bienCaracteristique.save();
      await bienCaracteristique.populate('id_caracteristique');
    }

    res.status(201).json({
      success: true,
      message: 'Caractéristique ajoutée au bien avec succès',
      data: bienCaracteristique
    });
  } catch (error) {
    console.error('Error adding caracteristique to bien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la caractéristique au bien',
      error: error.message
    });
  }
};

// PUT /api/caracteristiques/biens/:idBien/caracteristiques/:idCaracteristique - Modifier une caractéristique d'un bien
exports.updateCaracteristiqueBien = async (req, res) => {
  try {
    const { valeur } = req.body;

    const bienCaracteristique = await BienCaracteristique.findOneAndUpdate(
      { 
        id_bien: req.params.idBien, 
        id_caracteristique: req.params.idCaracteristique 
      },
      { valeur: valeur.trim() },
      { new: true, runValidators: true }
    ).populate('id_caracteristique');

    if (!bienCaracteristique) {
      return res.status(404).json({
        success: false,
        message: 'Association bien-caractéristique non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Caractéristique du bien modifiée avec succès',
      data: bienCaracteristique
    });
  } catch (error) {
    console.error('Error updating bien caracteristique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la caractéristique du bien',
      error: error.message
    });
  }
};

// DELETE /api/caracteristiques/biens/:idBien/caracteristiques/:idCaracteristique - Supprimer caractéristique d'un bien
exports.removeCaracteristiqueFromBien = async (req, res) => {
  try {
    const bienCaracteristique = await BienCaracteristique.findOneAndDelete({
      id_bien: req.params.idBien,
      id_caracteristique: req.params.idCaracteristique
    });

    if (!bienCaracteristique) {
      return res.status(404).json({
        success: false,
        message: 'Association bien-caractéristique non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Caractéristique retirée du bien avec succès'
    });
  } catch (error) {
    console.error('Error removing caracteristique from bien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du retrait de la caractéristique du bien',
      error: error.message
    });
  }
};

// POST /api/caracteristiques/biens/:id/caracteristiques/batch - Ajouter plusieurs caractéristiques en une fois
exports.addMultipleCaracteristiques = async (req, res) => {
  try {
    const { caracteristiques } = req.body;
    const id_bien = req.params.id;

    const operations = caracteristiques.map(carac => ({
      updateOne: {
        filter: {
          id_bien: id_bien,
          id_caracteristique: carac.id_caracteristique
        },
        update: {
          $set: {
            valeur: carac.valeur.trim(),
            date_ajout: new Date()
          }
        },
        upsert: true
      }
    }));

    await BienCaracteristique.bulkWrite(operations);

    const updatedCaracteristiques = await BienCaracteristique.find({ id_bien })
      .populate('id_caracteristique');

    res.status(201).json({
      success: true,
      message: 'Caractéristiques ajoutées avec succès',
      data: updatedCaracteristiques
    });
  } catch (error) {
    console.error('Error adding multiple caracteristiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout des caractéristiques',
      error: error.message
    });
  }
};
