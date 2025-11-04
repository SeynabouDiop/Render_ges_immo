const express = require('express');
const Caracteristique = require('../models/Caracteristique');
const BienCaracteristique = require('../models/BienCaracteristique');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/caracteristiques - Liste toutes les caractéristiques
router.get('/', async (req, res) => {
  try {
    const caracteristiques = await Caracteristique.find().sort({ categorie: 1, libelle: 1 });
    res.json(caracteristiques);
  } catch (error) {
    console.error('Error fetching caracteristiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/caracteristiques/categorie/:categorie - Caractéristiques par catégorie
router.get('/categorie/:categorie', async (req, res) => {
  try {
    const { categorie } = req.params;
    const caracteristiques = await Caracteristique.find({ categorie }).sort({ libelle: 1 });
    res.json(caracteristiques);
  } catch (error) {
    console.error('Error fetching caracteristiques by category:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/caracteristiques/:id - Détail d'une caractéristique
router.get('/:id', async (req, res) => {
  try {
    const caracteristique = await Caracteristique.findById(req.params.id);
    if (!caracteristique) {
      return res.status(404).json({ message: 'Caractéristique non trouvée' });
    }
    res.json(caracteristique);
  } catch (error) {
    console.error('Error fetching caracteristique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/caracteristiques - Créer une caractéristique (Admin seulement)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const caracteristique = new Caracteristique(req.body);
    await caracteristique.save();
    res.status(201).json(caracteristique);
  } catch (error) {
    console.error('Error creating caracteristique:', error);
    res.status(500).json({ message: 'Erreur lors de la création' });
  }
});

// PUT /api/caracteristiques/:id - Modifier une caractéristique (Admin seulement)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const caracteristique = await Caracteristique.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!caracteristique) {
      return res.status(404).json({ message: 'Caractéristique non trouvée' });
    }
    res.json(caracteristique);
  } catch (error) {
    console.error('Error updating caracteristique:', error);
    res.status(500).json({ message: 'Erreur lors de la modification' });
  }
});

// DELETE /api/caracteristiques/:id - Supprimer une caractéristique (Admin seulement)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    // Vérifier si la caractéristique est utilisée dans des biens
    const utilisations = await BienCaracteristique.countDocuments({ 
      id_caracteristique: req.params.id 
    });

    if (utilisations > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer : caractéristique utilisée dans des biens' 
      });
    }

    const caracteristique = await Caracteristique.findByIdAndDelete(req.params.id);
    if (!caracteristique) {
      return res.status(404).json({ message: 'Caractéristique non trouvée' });
    }
    res.json({ message: 'Caractéristique supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting caracteristique:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

// GESTION DES CARACTÉRISTIQUES DES BIENS

// GET /api/caracteristiques/bien/:idBien - Caractéristiques d'un bien
router.get('/bien/:idBien', async (req, res) => {
  try {
    const { idBien } = req.params;
    
    const bienCaracteristiques = await BienCaracteristique.find({ id_bien: idBien })
      .populate('id_caracteristique', 'libelle categorie')
      .exec();

    const caracteristiques = bienCaracteristiques.map(bc => ({
      _id: bc.id_caracteristique._id,
      libelle: bc.id_caracteristique.libelle,
      categorie: bc.id_caracteristique.categorie,
      valeur: bc.valeur
    }));

    res.json(caracteristiques);
  } catch (error) {
    console.error('Error fetching bien caracteristiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/caracteristiques/bien - Ajouter une caractéristique à un bien
router.post('/bien', auth, async (req, res) => {
  try {
    const { id_bien, id_caracteristique, valeur } = req.body;

    // Vérifier si l'association existe déjà
    const existing = await BienCaracteristique.findOne({
      id_bien,
      id_caracteristique
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'Cette caractéristique est déjà associée au bien' 
      });
    }

    const bienCaracteristique = new BienCaracteristique({
      id_bien,
      id_caracteristique,
      valeur
    });

    await bienCaracteristique.save();

    const populated = await BienCaracteristique.findById(bienCaracteristique._id)
      .populate('id_caracteristique', 'libelle categorie');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error adding caracteristique to bien:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout' });
  }
});

// PUT /api/caracteristiques/bien/:idBien/:idCaracteristique - Modifier la valeur
router.put('/bien/:idBien/:idCaracteristique', auth, async (req, res) => {
  try {
    const { idBien, idCaracteristique } = req.params;
    const { valeur } = req.body;

    const bienCaracteristique = await BienCaracteristique.findOneAndUpdate(
      { id_bien: idBien, id_caracteristique: idCaracteristique },
      { valeur },
      { new: true, runValidators: true }
    ).populate('id_caracteristique', 'libelle categorie');

    if (!bienCaracteristique) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    res.json(bienCaracteristique);
  } catch (error) {
    console.error('Error updating bien caracteristique:', error);
    res.status(500).json({ message: 'Erreur lors de la modification' });
  }
});

// DELETE /api/caracteristiques/bien/:idBien/:idCaracteristique - Retirer une caractéristique
router.delete('/bien/:idBien/:idCaracteristique', auth, async (req, res) => {
  try {
    const { idBien, idCaracteristique } = req.params;

    const result = await BienCaracteristique.findOneAndDelete({
      id_bien: idBien,
      id_caracteristique: idCaracteristique
    });

    if (!result) {
      return res.status(404).json({ message: 'Association non trouvée' });
    }

    res.json({ message: 'Caractéristique retirée du bien avec succès' });
  } catch (error) {
    console.error('Error removing caracteristique from bien:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

module.exports = router;