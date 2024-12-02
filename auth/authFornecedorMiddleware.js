const jwt = require('jsonwebtoken');
const { sequelize } = require('../models'); // Certifique-se de que o sequelize está corretamente configurado no seu projeto
require('dotenv').config();

const authFornecedorMiddleware = async (req, res, next) => {
    try {
        // Obter o token do cabeçalho Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log(token);
        if (!token) {
            return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
        }

        // Verificar e decodificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const fornecedorId = decoded.fornecedorId; // Certifique-se de que o payload do token contém o `fornecedorId`

        // Buscar fornecedor no banco de dados com Sequelize
        const [fornecedores] = await sequelize.query(
            'SELECT * FROM fornecedores WHERE id = :id',
            {
                replacements: { id: fornecedorId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!fornecedores || fornecedores.length === 0) {
            return res.status(404).json({ message: 'Fornecedor não encontrado.' });
        }

        // Adicionar dados do fornecedor ao objeto req
        req.fornecedor = fornecedores[0]; // O primeiro registro encontrado

        // Continuar para o próximo middleware ou rota
        next();
    } catch (error) {
        console.error('Erro na autenticação do fornecedor:', error);
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = authFornecedorMiddleware;
