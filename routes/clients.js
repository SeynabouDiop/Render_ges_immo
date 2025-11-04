const express = require('express');
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  updateProfile,
  getProfile
} = require('../controllers/clientController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Admin routes
router.get('/', auth, adminAuth, getAllClients);
router.post('/', auth, adminAuth, createClient);
router.get('/:id', auth, adminAuth, getClientById);
router.put('/:id', auth, adminAuth, updateClient);
router.delete('/:id', auth, adminAuth, deleteClient);

// Client routes
router.get('/profile/me', auth, getProfile);
router.put('/profile/me', auth, updateProfile);

module.exports = router;