const mongoose = require('mongoose');
const connectDB = require('../config/database');
const TypeBien = require('../models/TypeBien');
const Caracteristique = require('../models/Caracteristique');

const seedData = async () => {
  try {
    await connectDB();

    // Types de bien
    const typesBien = [
      { libelle: 'Appartement', description: 'Logement dans un immeuble collectif' },
      { libelle: 'Maison', description: 'Habitation individuelle' },
      { libelle: 'Studio', description: 'Petit logement avec pièce unique' },
      { libelle: 'Loft', description: 'Grand espace ouvert' },
      { libelle: 'Local commercial', description: 'Espace dédié à une activité commerciale' },
      { libelle: 'Bureau', description: 'Espace de travail' },
      { libelle: 'Entrepôt', description: 'Espace de stockage' }
    ];

    await TypeBien.deleteMany({});
    await TypeBien.insertMany(typesBien);

    // Caractéristiques
    const caracteristiques = [
      // Intérieur
      { libelle: 'Cuisine équipée', categorie: 'interieur', ordre_affichage: 1 },
      { libelle: 'Cheminée', categorie: 'interieur', ordre_affichage: 2 },
      { libelle: 'Parquet', categorie: 'interieur', ordre_affichage: 3 },
      { libelle: 'Double vitrage', categorie: 'interieur', ordre_affichage: 4 },
      { libelle: 'Climatisation', categorie: 'interieur', ordre_affichage: 5 },
      // Extérieur
      { libelle: 'Balcon', categorie: 'exterieur', ordre_affichage: 1 },
      { libelle: 'Terrasse', categorie: 'exterieur', ordre_affichage: 2 },
      { libelle: 'Jardin', categorie: 'exterieur', ordre_affichage: 3 },
      { libelle: 'Piscine', categorie: 'exterieur', ordre_affichage: 4 },
      { libelle: 'Parking', categorie: 'exterieur', ordre_affichage: 5 },
      // Sécurité
      { libelle: 'Alarme', categorie: 'securite', ordre_affichage: 1 },
      { libelle: 'Interphone', categorie: 'securite', ordre_affichage: 2 },
      { libelle: 'Digicode', categorie: 'securite', ordre_affichage: 3 },
      { libelle: 'Vidéophone', categorie: 'securite', ordre_affichage: 4 },
      // Énergie
      { libelle: 'Panneaux solaires', categorie: 'energie', ordre_affichage: 1 },
      { libelle: 'Pompe à chaleur', categorie: 'energie', ordre_affichage: 2 },
      // Confort
      { libelle: 'Ascenseur', categorie: 'confort', ordre_affichage: 1 },
      { libelle: 'Cave', categorie: 'confort', ordre_affichage: 2 },
      { libelle: 'Buanderie', categorie: 'confort', ordre_affichage: 3 }
    ];

    await Caracteristique.deleteMany({});
    await Caracteristique.insertMany(caracteristiques);

    console.log('✅ Données initiales créées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
    process.exit(1);
  }
};

seedData();