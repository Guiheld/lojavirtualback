const Carrinho = require('../models/carrinho');
const Produto = require('../models/produto'); 

exports.addToCarrinho = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let carrinho = await Carrinho.findOne({ where: { userId } });
    if (!carrinho) {
      carrinho = await Carrinho.create({ userId });
    }

    const produto = await Produto.findByPk(productId); 
    if (!produto) {
      console.log('Produto não encontrado! ', productId)
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const carrinhoProduto = await carrinho.getProdutos({ where: { id: productId } });
    if (carrinhoProduto.length > 0) {
      const currentQuantity = carrinhoProduto[0].CarrinhoProduto.quantity;
      const newQuantity = currentQuantity + quantity;
      const newTotal = newQuantity * produto.preco;
      await carrinho.addProduto(produto, { through: { quantity: newQuantity, total: newTotal } });
    } else {
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
  console.log("DEBUG BACKEND REQ: ", req.body);
  try {
    const productId = parseInt(req.params.produtoId, 10); 

    const carrinho = await Carrinho.findOne({ where: { userId: req.user.userId } }); 
    if (!carrinho) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }
    const existingProduct = await carrinho.getProdutos({ where: { id: productId } });
    if (existingProduct.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado no carrinho' });
    }
    await carrinho.removeProduto(productId); 

    const updatedCarrinho = await Carrinho.findOne({
      where: { userId: req.user.userId },
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

    // Busca o carrinho com os produtos relacionados
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

    // Extração dos produtos para retornar apenas o array de produtos
    const produtos = carrinho.produtos.map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao,
      quantity: produto.CarrinhoProduto.quantity,
      total: produto.CarrinhoProduto.total,
    }));
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};