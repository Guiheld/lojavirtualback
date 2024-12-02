const express = require('express');
const router = express.Router();
const productController = require('../controller/produtoController');
const Auth = require('../auth/authMiddleware')
const AuthFornecedor = require('../auth/authFornecedorMiddleware')

router.post('/', AuthFornecedor, productController.createProduct);
router.get('/', productController.getAllProducts);
router.put('/:id', AuthFornecedor, productController.updateProduct);
router.delete('/:id', AuthFornecedor, productController.deleteProduct);

module.exports = router;