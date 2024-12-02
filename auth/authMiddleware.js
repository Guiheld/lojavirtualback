const { sequelize } = require('../config/database');
const jwt = require('jsonwebtoken');

// Função para verificar se o usuário existe na tabela
const getUserById = async (id) => {
    try {
        const [user] = await sequelize.query(
            `SELECT * FROM users WHERE id = :id`,  // Usar :id para corresponder ao parâmetro
            {
                replacements: { id: id },  // Usar `id` no objeto de substituições
                type: sequelize.QueryTypes.SELECT // Define o tipo de consulta como SELECT
            }
        );
        return user; // Retorna o usuário encontrado ou `undefined` se não houver resultados
    } catch (error) {
        console.error('Erro ao buscar usuário no banco de dados:', error);
        throw new Error('Erro interno ao buscar usuário');
    }
};

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
        }

        // Verificar se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);  // Verifique se `decoded` contém o campo `userId`

        // Verificar se o usuário existe no banco de dados
        const user = await getUserById(decoded.userId); // Alterado de `decoded.id` para `decoded.userId`
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Adicionar os dados do usuário ao objeto `req` para uso posterior
        req.user = user;
        console.log("USUARIO AUTHENTICADO !!!")
        next();
    } catch (error) {
        console.error('Erro na autenticação do usuário:', error);
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;
