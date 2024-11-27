const express = require('express');
const router = express.Router();
const productController = require('../controller/produtoController');

router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;