const express = require('express');
const BienImmobilier = require('../models/BienImmobilier');
const TypeBien = require('../models/TypeBien');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// TYPES DE BIEN

// GET /api/biens/types - Liste des types de bien
router.get('/types', async (req, res) => {
  try {
    const types = await TypeBien.find().sort({ libelle: 1 });
    res.json(types);
  } catch (error) {
    console.error('Error fetching types bien:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/biens/types - Créer un type de bien (Admin seulement)
router.post('/types', auth, adminAuth, async (req, res) => {
  try {
    const typeBien = new TypeBien(req.body);
    await typeBien.save();
    res.status(201).json(typeBien);
  } catch (error) {
    console.error('Error creating type bien:', error);
    res.status(500).json({ message: 'Erreur lors de la création' });
  }
});

// PUT /api/biens/types/:id - Modifier un type de bien (Admin seulement)
router.put('/types/:id', auth, adminAuth, async (req, res) => {
  try {
    const typeBien = await TypeBien.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!typeBien) {
      return res.status(404).json({ message: 'Type de bien non trouvé' });
    }
    res.json(typeBien);
  } catch (error) {
    console.error('Error updating type bien:', error);
    res.status(500).json({ message: 'Erreur lors de la modification' });
  }
});

// DELETE /api/biens/types/:id - Supprimer un type de bien (Admin seulement)
router.delete('/types/:id', auth, adminAuth, async (req, res) => {
  try {
    // Vérifier si le type est utilisé dans des biens
    const utilisations = await BienImmobilier.countDocuments({ 
      id_type_bien: req.params.id 
    });

    if (utilisations > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer : type utilisé dans des biens' 
      });
    }

    const typeBien = await TypeBien.findByIdAndDelete(req.params.id);
    if (!typeBien) {
      return res.status(404).json({ message: 'Type de bien non trouvé' });
    }
    res.json({ message: 'Type de bien supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting type bien:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

// BIENS IMMOBILIERS

// GET /api/biens - Liste tous les biens
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      ville,
      prix_min,
      prix_max,
      surface_min,
      surface_max,
      statut
    } = req.query;

    const filter = {};
    
    if (type) filter.id_type_bien = type;
    if (ville) filter.ville = new RegExp(ville, 'i');
    if (statut) filter.statut = statut;
    
    if (prix_min || prix_max) {
      filter.$or = [
        { prix_location: { $gte: Number(prix_min) || 0, $lte: Number(prix_max) || 1000000 } },
        { prix_vente: { $gte: Number(prix_min) || 0, $lte: Number(prix_max) || 10000000 } }
      ];
    }
    
    if (surface_min || surface_max) {
      filter.surface_habitable = {
        $gte: Number(surface_min) || 0,
        $lte: Number(surface_max) || 1000
      };
    }

    const biens = await BienImmobilier.find(filter)
      .populate('id_type_bien', 'libelle')
      .populate('id_proprietaire', 'id_utilisateur')
      .populate('id_agent', 'nom prenom email')
      .sort({ date_creation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BienImmobilier.countDocuments(filter);

    res.json({
      biens,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching biens:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/biens/disponibles - Biens disponibles
router.get('/disponibles', async (req, res) => {
  try {
    const biens = await BienImmobilier.find({ statut: 'disponible' })
      .populate('id_type_bien', 'libelle')
      .populate('id_proprietaire', 'id_utilisateur')
      .sort({ date_creation: -1 });

    res.json(biens);
  } catch (error) {
    console.error('Error fetching available biens:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/biens/proprietaire/:id - Biens d'un propriétaire
router.get('/proprietaire/:id', auth, async (req, res) => {
  try {
    const biens = await BienImmobilier.find({ id_proprietaire: req.params.id })
      .populate('id_type_bien', 'libelle')
      .populate('id_agent', 'nom prenom email')
      .sort({ date_creation: -1 });

    res.json(biens);
  } catch (error) {
    console.error('Error fetching proprietaire biens:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/biens/:id - Détail d'un bien
router.get('/:id', async (req, res) => {
  try {
    const bien = await BienImmobilier.findById(req.params.id)
      .populate('id_type_bien', 'libelle description')
      .populate('id_proprietaire')
      .populate('id_agent', 'nom prenom email telephone');

    if (!bien) {
      return res.status(404).json({ message: 'Bien non trouvé' });
    }

    res.json(bien);
  } catch (error) {
    console.error('Error fetching bien:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/biens - Créer un bien
router.post('/', auth, async (req, res) => {
  try {
    const bienData = {
      ...req.body,
      id_proprietaire: req.user.id // L'utilisateur connecté devient le propriétaire
    };

    const bien = new BienImmobilier(bienData);
    await bien.save();

    const bienPopule = await BienImmobilier.findById(bien._id)
      .populate('id_type_bien', 'libelle')
      .populate('id_proprietaire', 'id_utilisateur');

    res.status(201).json(bienPopule);
  } catch (error) {
    console.error('Error creating bien:', error);
    res.status(500).json({ message: 'Erreur lors de la création du bien' });
  }
});

// PUT /api/biens/:id - Modifier un bien
router.put('/:id', auth, async (req, res) => {
  try {
    const bien = await BienImmobilier.findById(req.params.id);

    if (!bien) {
      return res.status(404).json({ message: 'Bien non trouvé' });
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (bien.id_proprietaire.toString() !== req.user.id && req.user.type_utilisateur !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const bienModifie = await BienImmobilier.findByIdAndUpdate(
      req.params.id,
      { ...req.body, date_modification: new Date() },
      { new: true, runValidators: true }
    )
    .populate('id_type_bien', 'libelle')
    .populate('id_proprietaire', 'id_utilisateur')
    .populate('id_agent', 'nom prenom email');

    res.json(bienModifie);
  } catch (error) {
    console.error('Error updating bien:', error);
    res.status(500).json({ message: 'Erreur lors de la modification du bien' });
  }
});

// DELETE /api/biens/:id - Supprimer un bien
router.delete('/:id', auth, async (req, res) => {
  try {
    const bien = await BienImmobilier.findById(req.params.id);

    if (!bien) {
      return res.status(404).json({ message: 'Bien non trouvé' });
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (bien.id_proprietaire.toString() !== req.user.id && req.user.type_utilisateur !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    await BienImmobilier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bien supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting bien:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du bien' });
  }
});

// POST /api/biens/search - Recherche avancée
router.post('/search', async (req, res) => {
  try {
    const filters = req.body;
    const query = {};

    if (filters.type) query.id_type_bien = filters.type;
    if (filters.ville) query.ville = new RegExp(filters.ville, 'i');
    if (filters.code_postal) query.code_postal = new RegExp(filters.code_postal, 'i');
    if (filters.statut) query.statut = filters.statut;

    if (filters.prix_location_min || filters.prix_location_max) {
      query.prix_location = {
        $gte: Number(filters.prix_location_min) || 0,
        $lte: Number(filters.prix_location_max) || 10000
      };
    }

    if (filters.prix_vente_min || filters.prix_vente_max) {
      query.prix_vente = {
        $gte: Number(filters.prix_vente_min) || 0,
        $lte: Number(filters.prix_vente_max) || 10000000
      };
    }

    if (filters.surface_min || filters.surface_max) {
      query.surface_habitable = {
        $gte: Number(filters.surface_min) || 0,
        $lte: Number(filters.surface_max) || 1000
      };
    }

    if (filters.nb_pieces_min) query.nb_pieces = { $gte: Number(filters.nb_pieces_min) };
    if (filters.nb_chambres_min) query.nb_chambres = { $gte: Number(filters.nb_chambres_min) };

    const biens = await BienImmobilier.find(query)
      .populate('id_type_bien', 'libelle')
      .populate('id_proprietaire', 'id_utilisateur')
      .sort({ date_creation: -1 });

    res.json(biens);
  } catch (error) {
    console.error('Error searching biens:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche' });
  }
});

// GET /api/biens/statistiques/overview - Statistiques
router.get('/statistiques/overview', auth, async (req, res) => {
  try {
    const totalBiens = await BienImmobilier.countDocuments();
    const biensDisponibles = await BienImmobilier.countDocuments({ statut: 'disponible' });
    const biensLoues = await BienImmobilier.countDocuments({ statut: 'loue' });
    const biensVendus = await BienImmobilier.countDocuments({ statut: 'vendu' });

    // Répartition par type de bien
    const repartitionTypes = await BienImmobilier.aggregate([
      {
        $lookup: {
          from: 'typebiens',
          localField: 'id_type_bien',
          foreignField: '_id',
          as: 'type_bien'
        }
      },
      {
        $group: {
          _id: '$id_type_bien',
          count: { $sum: 1 },
          libelle: { $first: '$type_bien.libelle' }
        }
      }
    ]);

    // Valeur totale du patrimoine
    const valeurTotale = await BienImmobilier.aggregate([
      {
        $group: {
          _id: null,
          totalVente: { $sum: '$prix_vente' },
          totalLocation: { $sum: '$prix_location' }
        }
      }
    ]);

    res.json({
      totalBiens,
      biensDisponibles,
      biensLoues,
      biensVendus,
      repartitionTypes,
      valeurTotale: valeurTotale[0] || { totalVente: 0, totalLocation: 0 }
    });
  } catch (error) {
    console.error('Error fetching statistiques:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
  }
});

module.exports = router;