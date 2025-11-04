const mongoose = require('mongoose');

const bienImmobilierSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  id_proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proprietaire',
    required: true
  },
  id_agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  id_type_bien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypeBien',
    required: true
  },
  titre: {
    type: String,
    required: true,
    maxlength: 255
  },
  description: {
    type: String,
    maxlength: 2000
  },
  adresse: {
    type: String,
    required: true
  },
  complement_adresse: String,
  code_postal: {
    type: String,
    required: true
  },
  ville: {
    type: String,
    required: true
  },
  pays: {
    type: String,
    default: 'France'
  },
  latitude: Number,
  longitude: Number,
  surface_habitable: {
    type: Number,
    required: true
  },
  surface_terrain: Number,
  nb_pieces: Number,
  nb_chambres: Number,
  nb_sdb: Number,
  nb_wc: Number,
  annee_construction: Number,
  dpe_energie: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  },
  dpe_ges: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  },
  etat_bien: {
    type: String,
    enum: ['neuf', 'excellent', 'bon', 'renovation', 'travaux'],
    default: 'bon'
  },
  statut: {
    type: String,
    enum: ['disponible', 'loue', 'vendu', 'reserve', 'indisponible'],
    default: 'disponible'
  },
  prix_vente: Number,
  prix_location: Number,
  charges_mensuelles: {
    type: Number,
    default: 0
  },
  depot_garantie: Number,
  photos: [String],
  date_creation: {
    type: Date,
    default: Date.now
  },
  date_modification: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour les recherches
bienImmobilierSchema.index({ id_proprietaire: 1 });
bienImmobilierSchema.index({ id_type_bien: 1 });
bienImmobilierSchema.index({ ville: 1, code_postal: 1 });
bienImmobilierSchema.index({ statut: 1 });
bienImmobilierSchema.index({ prix_location: 1 });
bienImmobilierSchema.index({ prix_vente: 1 });
bienImmobilierSchema.index({ surface_habitable: 1 });

// Middleware pour générer la référence avant sauvegarde
bienImmobilierSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('BienImmobilier').countDocuments();
    this.reference = `BIEN-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('BienImmobilier', bienImmobilierSchema);