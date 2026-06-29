const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { categoryValidation } = require('../validations');

router.use(authenticate);

router.get('/', categoryController.getCategories);
router.post('/', categoryValidation, validate, categoryController.createCategory);
router.put('/:id', categoryValidation, validate, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
