const express = require('express');
const router = express.Router();
const { saveProfile, getProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, saveProfile);
router.get('/', protect, getProfile);

module.exports = router;