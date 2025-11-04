const express = require('express');
const {
  createVisite,
  getAllVisites,
  getVisiteById,
  updateVisite,
  deleteVisite,
  getVisitesByAgent,
  getVisitesByBien
} = require('../controllers/visiteController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Routes protégées
router.post('/', auth, createVisite);
router.get('/', auth, getAllVisites);
router.get('/agent/:agentId', auth, getVisitesByAgent);
router.get('/bien/:bienId', auth, getVisitesByBien);
router.get('/:id', auth, getVisiteById);
router.put('/:id', auth, updateVisite);
router.delete('/:id', auth, adminAuth, deleteVisite);

module.exports = router;