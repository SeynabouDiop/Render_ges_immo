const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');

// Connect to database
connectDB();

const app = express();

// =============================================
// CONFIGURATION CORS ULTIME
// =============================================

// Middleware CORS ultra-permissif pour la production
app.use(cors({
  origin: function (origin, callback) {
    // Liste des origines autorisées
    const allowedOrigins = [
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      'https://frontend-psi-eight-73.vercel.app',
      'https://*.vercel.app'
    ];
    
    // En production, autorise toutes les origines pour tester
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    // En développement, vérifie les origines
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS bloqué pour:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ]
}));

// Gestion explicite des requêtes OPTIONS (preflight)
app.options('*', (req, res) => {
  console.log('🛫 Preflight OPTIONS request for:', req.url);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 
    'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Allow-Headers, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 heures
  res.status(200).send();
});

// =============================================
// MIDDLEWARES
// =============================================

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🌐 ${timestamp} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// =============================================
// ROUTES DE SANTÉ ET RACINE
// =============================================

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    message: '✅ API Gestion Immobilière fonctionne!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: req.headers.origin,
      allowed: true
    }
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: '🏠 API Gestion Immobilière',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      clients: '/api/clients',
      proprietaires: '/api/proprietaires',
      biens: '/api/biens'
    }
  });
});

// =============================================
// ROUTES API
// =============================================

// Routes d'authentification
app.use('/api/auth', require('./routes/auth'));

// Routes clients
app.use('/api/clients', require('./routes/clients'));

// Routes propriétaires
app.use('/api/proprietaires', require('./routes/proprietaires'));

// Routes agents (si existent)
try {
  app.use('/api/agents', require('./routes/agents'));
} catch (error) {
  console.log('⚠️  Routes agents non disponibles');
}

// Routes caractéristiques (si existent)
try {
  app.use('/api/caracteristiques', require('./routes/caracteristiques'));
} catch (error) {
  console.log('⚠️  Routes caractéristiques non disponibles');
}

// Routes biens immobiliers (si existent)
try {
  app.use('/api/biens', require('./routes/biens'));
} catch (error) {
  console.log('⚠️  Routes biens non disponibles');
}

// Routes visites (si existent)
try {
  app.use('/api/visites', require('./routes/visites'));
} catch (error) {
  console.log('⚠️  Routes visites non disponibles');
}

// Routes contrats (si existent)
try {
  app.use('/api/contrats', require('./routes/contrats'));
} catch (error) {
  console.log('⚠️  Routes contrats non disponibles');
}

// =============================================
// GESTION DES ERREURS - CORRECTION ICI !
// =============================================

// CORRECTION : Route 404 - Utilisez un chemin explicite au lieu de '*'
app.use((req, res, next) => {
  // Si aucune route n'a matché, c'est une 404
  console.log(`❌ Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/clients',
      'GET /api/proprietaires'
    ]
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  
  // Erreur CORS
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit par la politique CORS',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Origin non autorisée'
    });
  }
  
  // Autres erreurs
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// =============================================
// DÉMARRAGE DU SERVEUR
// =============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 SERVEUR DÉMARRÉ AVEC SUCCÈS!');
  console.log('='.repeat(50));
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📍 URL Render: https://render-ges-immo.onrender.com`);
  console.log(`🔍 Health check: /api/health`);
  console.log(`🌐 CORS activé pour:`);
  console.log(`   - http://localhost:4200`);
  console.log(`   - https://frontend-psi-eight-73.vercel.app`);
  console.log(`   - Toutes les origines en production`);
  console.log('='.repeat(50) + '\n');
});

// Gestion gracieuse de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur (SIGTERM)...');
  process.exit(0);
});
