require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    console.log("DEBUG BACKEND - authMiddleware, o que chegou: ", req.headers);

    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers['authorization'];
    console.log("DEBUG BACKEND - Authorization:", authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    // Verificar se o token existe
    if (!token) {
        return res.status(401).json({ message: 'Sem token, sem site.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DEBUG BACKEND - Token decodificado:", decoded);

        const user = await User.findById(decoded.userId); 
        if (!user) {
            return res.status(401).json({ message: 'Usuário não existe ou foi deletado.' });
        }

        req.user = decoded;

        next();
    } catch (error) {
        console.error('Erro no token:', error.message);
        res.status(400).json({ message: 'Erro no token.' });
    }
};

module.exports = authMiddleware;
