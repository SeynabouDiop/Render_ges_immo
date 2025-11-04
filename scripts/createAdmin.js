const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const createAdminUser = async () => {
  try {
    await connectDB();
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@immobilier.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }
    
    // Créer l'admin
    const adminUser = new User({
      nom: 'Admin',
      prenom: 'System',
      email: 'admin@immobilier.com',
      mot_de_passe: 'admin123', // Sera hashé automatiquement par le pre-save
      type_utilisateur: 'admin',
      telephone: '+33123456789'
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@immobilier.com');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();