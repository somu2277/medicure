const express = require('express');
const router = express.Router();
const { getAllLabTests, getLabTestById, createLabTest, updateLabTest, deleteLabTest } = require('../controllers/labTestController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllLabTests)
  .post(protect, authorizeRoles('SUPER_ADMIN', 'LAB_MANAGER'), createLabTest);

router.route('/:id')
  .get(getLabTestById)
  .put(protect, authorizeRoles('SUPER_ADMIN', 'LAB_MANAGER'), updateLabTest)
  .delete(protect, authorizeRoles('SUPER_ADMIN', 'LAB_MANAGER'), deleteLabTest);

module.exports = router;
