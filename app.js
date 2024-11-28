var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const authRoutes = require('./routes/authRoutes');
const produtosRoutes = require('./routes/produtoRoutes');
const carrinhosRoutes = require('./routes/carrinhoRoutes');
const User = require('./models/User');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');

const { syncDatabase, testConnection, } = require('./config/database'); // Função de sincronização
const cors = require('cors');
const PORT = process.env.PORT || 8080;

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(authRoutes);
app.use('/products', produtosRoutes);
app.use('/carrinho', carrinhosRoutes);

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

app.use('/', indexRouter);
app.use('/users', authRoutes);

module.exports = app;
