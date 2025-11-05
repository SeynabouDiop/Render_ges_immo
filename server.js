const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');

// SOLUTION SSL - Désactiver pour le développement
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('🔓 SSL verification disabled for development');
}

// Connect to database
connectDB();

const app = express();

// CORS complet - CORRECTION ICI
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'https://frontend-psi-eight-73.vercel.app', // SANS le slash final !
    'https://frontend-psi-eight-73.vercel.app'  // Enlever le slash
  ],
  credentials: true,
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ]
}));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    message: '✅ API Gestion Immobilière fonctionne!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/proprietaires', require('./routes/proprietaires'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/caracteristiques', require('./routes/caracteristiques'));
app.use('/api/biens', require('./routes/biens'));
app.use('/api/visites', require('./routes/visites'));
app.use('/api/contrats', require('./routes/contrats'));

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: '🏠 API Gestion Immobilière',
    version: '1.0.0',
    status: 'active'
  });
});

// CORRECTION : Gestion des erreurs 404 - "edr" → "/*"
app.use('*', (req, res) => {  // CORRIGE ICI
  res.status(404).json({
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server started successfully!`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS enabled for: https://frontend-psi-eight-73.vercel.app`);
});
