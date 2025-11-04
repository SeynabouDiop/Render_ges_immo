const express = require('express');
const router = express.Router();
const bienImmobilierController = require('../controllers/bienImmobilierController');
const auth = require('../middleware/auth');

// Routes publiques (pour les visiteurs)
router.get('/', bienImmobilierController.getAllBiens);
router.get('/:id', bienImmobilierController.getBienById);

// Routes protégées
router.post('/', auth, bienImmobilierController.createBien);
router.put('/:id', auth, bienImmobilierController.updateBien);
router.delete('/:id', auth, bienImmobilierController.deleteBien);
router.get('/proprietaire/:id_proprietaire', auth, bienImmobilierController.getBiensByProprietaire);
router.get('/stats/biens', auth, bienImmobilierController.getBiensStats);

module.exports = router;
