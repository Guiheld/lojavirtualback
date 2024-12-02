const express = require('express');
const router = express.Router();
const FornecedorController = require('../controller/fornecedorController');

router.post('/register', FornecedorController.register);
router.post('/login', FornecedorController.login);
router.get('/', FornecedorController.getAllFornecedores);

module.exports = router;