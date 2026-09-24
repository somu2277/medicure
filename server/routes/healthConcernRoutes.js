const express = require('express');
const router = express.Router();
const { HealthConcern } = require('../models/Classification');

// @desc    Fetch all health concerns
// @route   GET /api/health-concerns
router.get('/', async (req, res) => {
    try {
        const concerns = await HealthConcern.find({});
        res.json(concerns);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
