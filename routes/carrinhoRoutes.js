const express = require('express');
const router = express.Router();
const carrinhoController = require('../controller/carrinhoController');
const auth = require('../auth/authMiddleware')
router.use(auth);

router.post('/add', auth, carrinhoController.addToCarrinho);
router.delete('/remove/:id', auth, carrinhoController.removeFromCarrinho);
router.get('/:userId', auth, carrinhoController.viewCarrinho);

module.exports = router;