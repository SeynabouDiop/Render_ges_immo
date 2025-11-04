const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Proprietaire = require('../models/Proprietaire');
const BienImmobilier = require('../models/BienImmobilier');
const Contrat = require('../models/Contrat');

const router = express.Router();

// GET /api/proprietaires/profile - Profil propriétaire
router.get('/profile', auth, async (req, res) => {
    try {
        const proprietaire = await Proprietaire.findOne({ id_utilisateur: req.user.id })
            .populate('id_utilisateur', 'nom prenom email telephone');

        if (!proprietaire) {
            return res.status(404).json({ message: 'Propriétaire non trouvé' });
        }

        res.json(proprietaire);
    } catch (error) {
        console.error('Error fetching proprietaire profile:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/proprietaires/biens - Biens du propriétaire
router.get('/biens', auth, async (req, res) => {
    try {
        const proprietaire = await Proprietaire.findOne({ id_utilisateur: req.user.id });

        if (!proprietaire) {
            return res.status(404).json({ message: 'Propriétaire non trouvé' });
        }

        const biens = await BienImmobilier.find({ id_proprietaire: proprietaire._id })
            .populate('id_type_bien', 'libelle')
            .sort({ date_creation: -1 });

        res.json(biens);
    } catch (error) {
        console.error('Error fetching proprietaire biens:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/proprietaires/contrats - Contrats du propriétaire
router.get('/contrats', auth, async (req, res) => {
    try {
        const proprietaire = await Proprietaire.findOne({ id_utilisateur: req.user.id });

        if (!proprietaire) {
            return res.status(404).json({ message: 'Propriétaire non trouvé' });
        }

        // Trouver les biens du propriétaire
        const biens = await BienImmobilier.find({ id_proprietaire: proprietaire._id });
        const biensIds = biens.map(bien => bien._id);

        // Trouver les contrats liés à ces biens
        const contrats = await Contrat.find({ id_bien: { $in: biensIds } })
            .populate('id_bien', 'titre adresse ville')
            .populate('id_locataire', 'nom prenom email telephone')
            .sort({ date_debut: -1 });

        res.json(contrats);
    } catch (error) {
        console.error('Error fetching proprietaire contrats:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/proprietaires/statistiques - Statistiques propriétaire
router.get('/statistiques', auth, async (req, res) => {
    try {
        const proprietaire = await Proprietaire.findOne({ id_utilisateur: req.user.id });

        if (!proprietaire) {
            return res.status(404).json({ message: 'Propriétaire non trouvé' });
        }

        const biens = await BienImmobilier.find({ id_proprietaire: proprietaire._id });
        const biensIds = biens.map(bien => bien._id);

        const contrats = await Contrat.find({ id_bien: { $in: biensIds } });
        const contratsActifs = contrats.filter(contrat => contrat.statut === 'actif');

        const revenuMensuel = contratsActifs.reduce((total, contrat) => total + contrat.loyer_mensuel, 0);
        const tauxOccupation = biens.length > 0 ? (contratsActifs.length / biens.length) * 100 : 0;

        const statistiques = {
            totalBiens: biens.length,
            biensLoues: contratsActifs.length,
            biensDisponibles: biens.length - contratsActifs.length,
            revenuMensuel,
            tauxOccupation: Math.round(tauxOccupation),
            totalContrats: contrats.length
        };

        res.json(statistiques);
    } catch (error) {
        console.error('Error fetching proprietaire statistiques:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/proprietaires/biens - Ajouter un bien
router.post('/biens', auth, async (req, res) => {
    try {
        const proprietaire = await Proprietaire.findOne({ id_utilisateur: req.user.id });

        if (!proprietaire) {
            return res.status(404).json({ message: 'Propriétaire non trouvé' });
        }

        const bienData = {
            ...req.body,
            id_proprietaire: proprietaire._id,
            reference: `BIEN-${Date.now()}`,
            statut: 'disponible'
        };

        const nouveauBien = new BienImmobilier(bienData);
        await nouveauBien.save();

        const bienPopule = await BienImmobilier.findById(nouveauBien._id)
            .populate('id_type_bien', 'libelle');

        res.status(201).json(bienPopule);
    } catch (error) {
        console.error('Error creating bien:', error);
        res.status(500).json({ message: 'Erreur lors de la création du bien' });
    }
});

// PUT /api/proprietaires/biens/:id - Modifier un bien
router.put('/biens/:id', auth, async (req, res) => {
    try {
        const proprietaire = await Proprietaire.findOne({ id_utilisateur: req.user.id });

        if (!proprietaire) {
            return res.status(404).json({ message: 'Propriétaire non trouvé' });
        }

        // Vérifier que le bien appartient au propriétaire
        const bien = await BienImmobilier.findOne({
            _id: req.params.id,
            id_proprietaire: proprietaire._id
        });

        if (!bien) {
            return res.status(404).json({ message: 'Bien non trouvé ou accès non autorisé' });
        }

        const bienModifie = await BienImmobilier.findByIdAndUpdate(
            req.params.id,
            { ...req.body, date_modification: new Date() },
            { new: true, runValidators: true }
        ).populate('id_type_bien', 'libelle');

        res.json(bienModifie);
    } catch (error) {
        console.error('Error updating bien:', error);
        res.status(500).json({ message: 'Erreur lors de la modification du bien' });
    }
});

module.exports = router;