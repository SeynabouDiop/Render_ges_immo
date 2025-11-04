const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_jwt_tres_longue_et_securisee';

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - Headers:', req.headers);
    
    const authHeader = req.header('Authorization');
    console.log('📝 Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token received:', token.substring(0, 20) + '...');

    if (!token) {
      console.log('❌ Token is empty');
      return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded:', decoded);

    const user = await User.findById(decoded.id).select('-mot_de_passe');
    
    if (!user) {
      console.log('❌ User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Token invalide.' });
    }

    console.log('👤 User found:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré.' });
    }
    
    res.status(401).json({ message: 'Token invalide.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.type_utilisateur !== 'admin') {
      console.log('❌ User is not admin:', req.user.type_utilisateur);
      return res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
    }
    
    console.log('✅ Admin access granted');
    next();
  } catch (error) {
    console.error('❌ Admin auth error:', error);
    res.status(401).json({ message: 'Accès non autorisé.' });
  }
};

module.exports = { auth, adminAuth, JWT_SECRET };