const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { auth, adminAuth } = require('../middleware/auth');

// Routes pour les agents
router.post('/', auth, adminAuth, agentController.createAgent);
router.get('/', auth, adminAuth, agentController.getAllAgents);
router.get('/stats', auth, agentController.getAgentStats);
router.get('/:id', auth, adminAuth, agentController.getAgentById);
router.put('/:id', auth, adminAuth, agentController.updateAgent);
router.delete('/:id', auth, adminAuth, agentController.deleteAgent);

module.exports = router;
