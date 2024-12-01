var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const produtosRoutes = require('./routes/produtoRoutes');
const carrinhosRoutes = require('./routes/carrinhoRoutes');
const userRoutes = require('./routes/user');  

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');

const { syncDatabase, testConnection, } = require('./config/database'); // Função de sincronização
require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 8080;

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/products', produtosRoutes);
app.use('/carrinho', carrinhosRoutes);
app.use('/users', userRoutes);
app.use(express.json());

// Sincroniza o banco de dados e cria as tabelas antes de iniciar o servidor
(async () => {
  await testConnection();
  await syncDatabase();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
})();

app.get('/api/teste', (req, res) => {
  res.json({ message: 'Comunicação entre o back e front bem-sucedida!' });
});

module.exports = app;
