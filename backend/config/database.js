const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'mysql';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASS || '';
const database = process.env.DB_NAME || 'expense_tracker_db';

let sequelize;

if (dialect === 'mysql') {
  sequelize = new Sequelize(database, user, password, {
    host: host,
    port: port,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { timestamps: true, underscored: true }
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false,
    define: { timestamps: true, underscored: true }
  });
}

const connectDB = async () => {
  if (dialect === 'mysql') {
    try {
      // Auto-create database if it doesn't exist
      const connection = await mysql.createConnection({ host, port, user, password });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
      await connection.end();
      console.log(`[Database] MySQL schema \`${database}\` verified/created.`);

      await sequelize.authenticate();
      console.log(`[Database] Sequelize connected successfully via MySQL dialect.`);
    } catch (error) {
      console.warn(`[Database] Local MySQL connection failed (${error.message}). Swapping to file-based SQLite...`);
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../database.sqlite'),
        logging: false,
        define: { timestamps: true, underscored: true }
      });
      await sequelize.authenticate();
      console.log('[Database] SQLite database connected successfully.');
    }
  } else {
    await sequelize.authenticate();
    console.log('[Database] SQLite database connected successfully.');
  }
};

module.exports = {
  get sequelize() { return sequelize; },
  connectDB
};
