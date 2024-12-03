const User = require('../models/user');
const Carrinho = require('../models/Carrinho');
const Produto = require('../models/produto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { sequelize } = require('../config/database');
const Sequelize = require('sequelize');

// querry eh o bglh, n tem como

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
      // Verifica se o e-mail já está cadastrado usando uma query SQL
      const [existingUser] = await sequelize.query('SELECT * FROM Users WHERE email = :email', {
        replacements: { email },
        type: sequelize.QueryTypes.SELECT
      });
  
      if (existingUser) {
        return res.status(400).json({ message: 'Este email já foi utilizado para o cadastro de uma conta, realize o login.' });
      }
  
      // Cria o novo usuário, o hash da senha será gerado automaticamente devido ao hook 'beforeCreate'
      const user = await User.create({
        name,
        email,
        password // O hook 'beforeCreate' irá gerar o hash da senha
      });
  
      // Cria o carrinho para o novo usuário
      await Carrinho.create({ userId: user.id });
  
      // Cria o token JWT para o novo usuário
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
  
      // Retorna a resposta com o token e o userId
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!', token, userId: user.id, nome: user.name });
    } catch (error) {
      console.error('Erro no cadastro:', error.message);
      res.status(500).json({ message: 'Erro no servidor. Contate-nos.' });
    }
};
  
  
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      // Verifica se o usuário existe no banco de dados
      const user = await sequelize.query('SELECT * FROM Users WHERE email = :email', {
        replacements: { email },
        type: Sequelize.QueryTypes.SELECT
      });
  
      if (user.length === 0) {
        return res.status(400).json({ message: 'Usuário não encontrado para login.' });
      }
  
      const foundUser = user[0]; // Pega o primeiro usuário do array
  
      // Verifica a senha com bcrypt
      const isValid = await bcrypt.compare(password, foundUser.password);
      // Se a senha for inválida, retorna erro
      if (!isValid) {
        return res.status(400).json({ message: 'Senha errada.' });
      }
  
      // Cria o token JWT para o login
      const token = jwt.sign(
        { userId: foundUser.id, email: foundUser.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
  
      // Retorna a resposta com o token
      res.status(200).json({ message: 'Login feito com sucesso', token, userId: foundUser.id });
    } catch (error) {
      console.error('Erro no login:', error.message);
      res.status(500).json({ message: 'Erro no servidor. Contate-nos.' });
    }
  };

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'name', 'email']
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado e/ou nao existente.' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Erro ao pegar o perfil, mensagem de erro :', error.message);
    res.status(500).json({ message: 'Erro no servidor. Contate-nos.' });
  }
};