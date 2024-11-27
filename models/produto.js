const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Importa a instância do Sequelize

const produto = sequelize.define('produto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preco: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estoque: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  }
}, {
  timestamps: false
});

module.exports = produto;