const { Sequelize } = require("sequelize");

const connection = new Sequelize(process.env.MYSQL_URI, {
  retry: { match: [/Deadlock/i], max: 3 },

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

connection.authenticate();

module.exports = connection;
