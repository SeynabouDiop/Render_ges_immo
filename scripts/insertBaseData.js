const mongoose = require('mongoose');
const TypeBien = require('../models/TypeBien');
const Caracteristique = require('../models/Caracteristique');
const connectDB = require('../config/database');

const insertBaseData = async () => {
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

    for (const type of typesBien) {
      const existing = await TypeBien.findOne({ libelle: type.libelle });
      if (!existing) {
        await TypeBien.create(type);
        console.log(`✅ Type de bien créé: ${type.libelle}`);
      }
    }

    // Caractéristiques
    const caracteristiques = [
      // Intérieur
      { libelle: 'Cuisine équipée', categorie: 'interieur' },
      { libelle: 'Cheminée', categorie: 'interieur' },
      { libelle: 'Parquet', categorie: 'interieur' },
      { libelle: 'Double vitrage', categorie: 'interieur' },
      { libelle: 'Climatisation', categorie: 'interieur' },
      { libelle: 'Mezzanine', categorie: 'interieur' },
      { libelle: 'Verrière', categorie: 'interieur' },
      // Extérieur
      { libelle: 'Balcon', categorie: 'exterieur' },
      { libelle: 'Terrasse', categorie: 'exterieur' },
      { libelle: 'Jardin', categorie: 'exterieur' },
      { libelle: 'Piscine', categorie: 'exterieur' },
      { libelle: 'Parking', categorie: 'exterieur' },
      { libelle: 'Garage', categorie: 'exterieur' },
      { libelle: 'Cour', categorie: 'exterieur' },
      // Sécurité
      { libelle: 'Alarme', categorie: 'securite' },
      { libelle: 'Interphone', categorie: 'securite' },
      { libelle: 'Digicode', categorie: 'securite' },
      { libelle: 'Vidéophone', categorie: 'securite' },
      { libelle: 'Porte blindée', categorie: 'securite' },
      { libelle: 'Caméra surveillance', categorie: 'securite' },
      // Énergie
      { libelle: 'Panneaux solaires', categorie: 'energie' },
      { libelle: 'Pompe à chaleur', categorie: 'energie' },
      { libelle: 'Chauffage au sol', categorie: 'energie' },
      { libelle: 'VMC double flux', categorie: 'energie' },
      { libelle: 'Isolation renforcée', categorie: 'energie' },
      // Confort
      { libelle: 'Ascenseur', categorie: 'confort' },
      { libelle: 'Cave', categorie: 'confort' },
      { libelle: 'Buanderie', categorie: 'confort' },
      { libelle: 'Home cinéma', categorie: 'confort' },
      { libelle: 'Domotique', categorie: 'confort' },
      { libelle: 'Fibre optique', categorie: 'confort' }
    ];

    for (const carac of caracteristiques) {
      const existing = await Caracteristique.findOne({ libelle: carac.libelle });
      if (!existing) {
        await Caracteristique.create(carac);
        console.log(`✅ Caractéristique créée: ${carac.libelle}`);
      }
    }

    console.log('✅ Données de base insérées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
    process.exit(1);
  }
};

insertBaseData();