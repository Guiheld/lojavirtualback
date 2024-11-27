const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Função para registrar um novo usuário
exports.register = async (req, res) => {
  console.log('Função de cadastro acionada no lado do back');
  console.log('Dados recebidos:', req.body);
  const { name, email, password } = req.body;

  try {
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({ message: 'Usuário já existe!' });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o novo usuário no banco de dados
    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).send({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    return res.status(500).send({ message: 'Erro no servidor', details: err.message });
  }
};

// Função para autenticar um usuário
exports.login = async (req, res) => {
    console.log('Função de login acionada no lado do back');
    const { email, password } = req.body;
  
    try {
      // Verificar se o usuário existe
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).send({ message: 'Usuário não encontrado' });
      }
  
      // Comparar a senha fornecida com a senha armazenada
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send({ message: 'Senha incorreta' });
      }
  
      // Gerar o token JWT
      const token = jwt.sign({ userId: user.id }, 'seu_segredo_jwt', { expiresIn: '1h' });
  
      return res.status(200).send({ message: 'Login bem-sucedido!', token });
    } catch (err) {
      console.error('Erro no login:', err);
      return res.status(500).send({ message: 'Erro no servidor', details: err.message });
    }
};