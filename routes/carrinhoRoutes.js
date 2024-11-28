const express = require('express');
const router = express.Router();
const carrinhoController = require('../controller/carrinhoController');

router.post('/add', carrinhoController.addToCarrinho);
router.delete('/remove/:id', carrinhoController.removeFromCarrinho);
router.get('/:userId', carrinhoController.viewCarrinho);

module.exports = router;