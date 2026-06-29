const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { transactionValidation } = require('../validations');

router.use(authenticate);

router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.post('/', transactionValidation, validate, transactionController.createTransaction);
router.put('/:id', transactionValidation, validate, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
