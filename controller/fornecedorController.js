require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');

// desculpe prof, mas querrySQL > tudo

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Verificar se já existe um fornecedor com o email fornecido
        const [existingFornecedor] = await sequelize.query(
            `SELECT id FROM fornecedores WHERE email = :email LIMIT 1`,
            {
                replacements: { email },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (existingFornecedor) {
            return res.status(400).json({ message: 'Fornecedor já existe com este email.' });
        }

        // Validar a senha
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir novo fornecedor no banco de dados
        await sequelize.query(
            `INSERT INTO fornecedores (name, email, password) VALUES (:name, :email, :password)`,
            {
                replacements: { name, email, password: hashedPassword },
                type: sequelize.QueryTypes.INSERT,
            }
        );

        res.status(201).json({ message: 'Fornecedor cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar fornecedor:', error.message);
        res.status(500).json({ message: 'Erro no servidor. Contate-nos.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("email ", email, " password", password )
    try {
        const [fornecedor] = await sequelize.query(
            `SELECT id, name, email, password FROM fornecedores WHERE email = :email LIMIT 1`,
            {
                replacements: { email },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!fornecedor) {
            return res.status(400).json({ message: 'Fornecedor não encontrado.' });
        }

        const isValidPassword = await bcrypt.compare(password, fornecedor.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Senha inválida.' });
        }

        const token = jwt.sign(
            { fornecedorId: fornecedor.id, email: fornecedor.email, name: fornecedor.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.status(200).json({ message: 'Login bem-sucedido!', token, fornecedorId: fornecedor.id });
    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        res.status(500).json({ message: 'Erro no servidor. Contate-nos.' });
    }
};

exports.getAllFornecedores = async (req, res) => {
    try {
        const [fornecedores] = await sequelize.query(
            `SELECT id, name, email FROM fornecedores`
        );
        res.status(200).json(fornecedores);
    } catch (error) {
        console.error('Erro ao buscar fornecedores:', error.message);
        res.status(500).json({ message: 'Erro no servidor. Contate-nos.' });
    }
};
