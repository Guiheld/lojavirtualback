const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const Fornecedor = sequelize.define('fornecedor', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    email: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: { 
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Fornecedores',
    timestamps: false
});

Fornecedor.beforeCreate(async (fornecedor, options) => {
    const salt = await bcrypt.genSalt(10);
    fornecedor.password = await bcrypt.hash(fornecedor.password, salt);
});

Fornecedor.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Fornecedor;