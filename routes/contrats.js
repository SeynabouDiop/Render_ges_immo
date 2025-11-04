const express = require('express');
const {
  createContrat,
  getAllContrats,
  getContratById,
  updateContrat,
  deleteContrat,
  getContratsByLocataire,
  getContratsByBien,
  getContratsExpirant
} = require('../controllers/contratController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Routes protégées
router.post('/', auth, createContrat);
router.get('/', auth, getAllContrats);
router.get('/expirant', auth, getContratsExpirant);
router.get('/locataire/:locataireId', auth, getContratsByLocataire);
router.get('/bien/:bienId', auth, getContratsByBien);
router.get('/:id', auth, getContratById);
router.put('/:id', auth, updateContrat);
router.delete('/:id', auth, adminAuth, deleteContrat);

module.exports = router;