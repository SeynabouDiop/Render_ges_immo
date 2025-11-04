const express = require('express');
const router = express.Router();
const TypeBien = require('../models/TypeBien');
const { auth, adminAuth } = require('../middleware/auth');

// Obtenir tous les types de bien
router.get('/', async (req, res) => {
  try {
    const types = await TypeBien.find({ statut: 'actif' }).sort({ libelle: 1 });
    res.json(types);
  } catch (error) {
    console.error('Error fetching types bien:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des types de bien',
      error: error.message 
    });
  }
});

// Créer un type de bien (admin seulement)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { libelle, description, icone } = req.body;
    
    // Vérifier si le type existe déjà
    const existingType = await TypeBien.findOne({ libelle });
    if (existingType) {
      return res.status(400).json({ message: 'Ce type de bien existe déjà' });
    }
    
    const typeBien = new TypeBien({
      libelle,
      description,
      icone: icone || 'fa-home'
    });
    
    await typeBien.save();
    
    res.status(201).json({
      message: 'Type de bien créé avec succès',
      type: typeBien
    });
  } catch (error) {
    console.error('Error creating type bien:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du type de bien',
      error: error.message 
    });
  }
});

module.exports = router;
