const Carrinho = require('../models/carrinho');
const Produto = require('../models/produto'); // Corrigido para 'Produto'

exports.addToCarrinho = async (req, res) => {
  console.log("adicionar a carrinho ", req.body)
  try {
    const { userId, productId, quantity } = req.body;

    let carrinho = await Carrinho.findOne({ where: { userId } });
    if (!carrinho) {
      carrinho = await Carrinho.create({ userId });
    }

    const produto = await Produto.findByPk(productId); // Corrigido para 'Produto'
    if (!produto) {
      console.log('Produto não encontrado! ', productId)
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verificar se o produto já está no carrinho
    const carrinhoProduto = await carrinho.getProdutos({ where: { id: productId } });
    if (carrinhoProduto.length > 0) {
      // Produto já existe no carrinho, atualizar a quantidade
      const currentQuantity = carrinhoProduto[0].CarrinhoProduto.quantity;
      const newQuantity = currentQuantity + quantity;
      const newTotal = newQuantity * produto.preco;
      
      // Atualizar a tabela intermediária CarrinhoProduto
      await carrinho.addProduto(produto, { through: { quantity: newQuantity, total: newTotal } });
    } else {
      // Produto não está no carrinho, adicionar
      const total = quantity * produto.preco;
      await carrinho.addProduto(produto, { through: { quantity, total } });
    }

    const updatedCarrinho = await Carrinho.findOne({
      where: { userId },
      include: {
        model: Produto,
        attributes: ['id', 'nome', 'preco', 'descricao'],
        through: {
          attributes: ['quantity', 'total']
        }
      }
    });

    res.json(updatedCarrinho);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.removeFromCarrinho = async (req, res) => {
  try {
    const { userId } = req.body;
    const productId = parseInt(req.params.id, 10);

    const carrinho = await Carrinho.findOne({ where: { userId } });
    if (!carrinho) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    await carrinho.removeProduto(productId); // Corrigido para 'removeProduto'

    const updatedCarrinho = await Carrinho.findOne({
      where: { userId },
      include: {
        model: Produto,
        attributes: ['id', 'nome', 'preco', 'descricao'],
        through: {
          attributes: ['quantity', 'total']
        }
      }
    });

    res.json(updatedCarrinho);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.viewCarrinho = async (req, res) => {
  try {
    const { userId } = req.params;

    const carrinho = await Carrinho.findOne({
      where: { userId },
      include: {
        model: Produto,
        attributes: ['id', 'nome', 'preco', 'descricao'],
        through: {
          attributes: ['quantity', 'total']
        }
      }
    });

    if (!carrinho) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    res.json(carrinho);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
