const Carrinho = require('../models/Carrinho');
const Produto = require('../models/produto'); 
const { sequelize } = require('../config/database');

exports.addToCarrinho = async (req, res) => {
  try {
    const userId = req.user.id; // Obtém o userId do token
    console.log(userId)

    const { productId, quantity } = req.body;  // Recebe o produto e a quantidade

    // Verifica se o usuário já possui um carrinho
    let carrinho = await Carrinho.findOne({ where: { userId } });
    if (!carrinho) {
      // Se o carrinho não existe, cria um novo
      carrinho = await Carrinho.create({ userId });
    }

    // Busca o produto pelo ID
    const produto = await Produto.findByPk(productId);
    if (!produto) {
      // Caso o produto não seja encontrado, retorna erro
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verifica se o produto já está no carrinho
    const existingCarrinhoProduto = await carrinho.getProdutos({ where: { id: productId } });

    if (existingCarrinhoProduto.length > 0) {
      // Se o produto já estiver no carrinho, atualiza a quantidade e o total
      const carrinhoProduto = existingCarrinhoProduto[0].CarrinhoProduto;
      const novaQuantidade = carrinhoProduto.quantity + quantity;
      const novoTotal = novaQuantidade * produto.preco;

      // Atualiza o produto no carrinho com a nova quantidade e total
      await carrinho.addProduto(produto, { through: { quantity: novaQuantidade, total: novoTotal } });
    } else {
      // Se o produto não estiver no carrinho, adiciona o produto com a quantidade e o total
      const total = quantity * produto.preco;
      await carrinho.addProduto(produto, { through: { quantity, total } });
    }

    // Retorna o carrinho atualizado com os produtos
    const carrinhoAtualizado = await Carrinho.findOne({
      where: { userId },
      include: {
        model: Produto,
        attributes: ['id', 'nome', 'preco', 'descricao'],
        through: {
          attributes: ['quantity', 'total'],
        },
      },
    });
    console.log(carrinhoAtualizado);
    res.json(carrinhoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.removeFromCarrinho = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID do produto inválido' });
    }

    // Busca o carrinho do usuário
    const carrinho = await Carrinho.findOne({
      where: { userId },
      include: {
        model: Produto,
        attributes: ['id', 'nome', 'preco', 'descricao'],
        through: { attributes: ['quantity', 'total'] },
      },
    });

    if (!carrinho) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    // Verifica se o produto está no carrinho
    const produtoNoCarrinho = carrinho.produtos.find(produto => produto.id === productId);

    if (!produtoNoCarrinho) {
      return res.status(404).json({ message: 'Produto não encontrado no carrinho' });
    }

    // Remove o produto do carrinho
    await carrinho.removeProduto(productId);

    // Busca o carrinho atualizado
    const carrinhoAtualizado = await Carrinho.findOne({
      where: { userId },
      include: {
        model: Produto,
        attributes: ['id', 'nome', 'preco', 'descricao'],
        through: { attributes: ['quantity', 'total'] },
      },
    });

    // Formata os produtos restantes para a resposta
    const produtosRestantes = carrinhoAtualizado.produtos.map(produto => ({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao,
      quantity: produto.CarrinhoProduto.quantity,
      total: produto.CarrinhoProduto.total,
    }));

    // Retorna o carrinho atualizado
    res.json({ carrinho: carrinhoAtualizado, produtos: produtosRestantes });
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    res.status(400).json({ message: error.message });
  }
};


exports.viewCarrinho = async (req, res) => {
  try {
    const { userId } = req.params;

    // Busca o carrinho e seus produtos relacionados
    const carrinho = await Carrinho.findOne({
      where: { userId },
      include: {
        model: Produto,
        attributes: ['id', 'nome', 'preco', 'descricao'],
        through: {
          attributes: ['quantity', 'total'], // Obtém dados do relacionamento CarrinhoProduto
        },
      },
    });

    if (!carrinho) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    // Retorna o carrinho com os produtos
    res.json(carrinho);
  } catch (error) {
    console.error('Erro ao visualizar o carrinho:', error);
    res.status(500).json({ message: error.message });
  }
};




