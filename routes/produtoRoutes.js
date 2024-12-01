const express = require('express');
const router = express.Router();
const productController = require('../controller/produtoController');
const Auth = require('../auth/authMiddleware')

router.post('/', Auth, productController.createProduct);
router.get('/', Auth, productController.getAllProducts);
router.put('/:id', Auth, productController.updateProduct);
router.delete('/:id', Auth, productController.deleteProduct);

module.exports = router;