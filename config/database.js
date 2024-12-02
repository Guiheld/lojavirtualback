const { Sequelize } = require('sequelize');

// Conexão com o banco de dados
const sequelize = new Sequelize(`lojavirtual`, 'LojaVirtual', 'LojaVirtualUser', {
  host: 'localhost',
  dialect: 'mysql',
});

// Testa a conexão com o banco de dados
const testConnection = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
    process.exit(1); // Finaliza o processo se a conexão falhar
  }
};

// Função para sincronizar o banco de dados (verifica/cria tabelas)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false, logging: console.log}); // `force: false` para não apagar dados existentes
    console.log('Tabelas verificadas/criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error.message);
    process.exit(1); // Finaliza o processo se falhar
  }
};

// Exporte o sequelize para ser usado em outros arquivos, como o modelo User
module.exports = {
  sequelize,
  testConnection,  // Pode ser útil para testar a conexão em `app.js`
  syncDatabase
};
