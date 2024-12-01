const express = require('express');
const router = express.Router();
const carrinhoController = require('../controller/carrinhoController');
const auth = require('../auth/authMiddleware')
router.use(auth);

router.post('/add', carrinhoController.addToCarrinho);
router.delete('/remove/:id', carrinhoController.removeFromCarrinho);
router.get('/:userId', carrinhoController.viewCarrinho);

module.exports = router;