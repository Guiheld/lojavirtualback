const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Importa a instância do Sequelize
const User = require('./user');
const Produto = require('./produto');

// Tabela intermediária CarrinhoProduto
const CarrinhoProduto = sequelize.define('CarrinhoProduto', {
  carrinhoId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Carrinhos', 
      key: 'id'
    },
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Produtos', 
      key: 'id'
    },
    primaryKey: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: false
});

// Modelo Carrinho
const Carrinho = sequelize.define('Carrinho', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: false
});

// Definindo as associações
Carrinho.belongsTo(User, { foreignKey: 'userId' });
Carrinho.belongsToMany(Produto, { through: CarrinhoProduto, foreignKey: 'carrinhoId', otherKey: 'productId' });
Produto.belongsToMany(Carrinho, { through: CarrinhoProduto, foreignKey: 'productId', otherKey: 'carrinhoId' });

console.log('Associações Carrinho.belongsToMany Produto definidas');

module.exports = Carrinho;
