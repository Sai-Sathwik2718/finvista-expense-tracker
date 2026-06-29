const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');
const os = require('os');
const fs = require('fs');
require('dotenv').config();

const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
const rawDialect = process.env.DB_DIALECT;
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASS || '';
const database = process.env.DB_NAME || 'expense_tracker_db';

// Determine dialect static instance once at module load time so models never detach
const dialect = (isProduction && (host === 'localhost' || !rawDialect)) ? 'sqlite' : (rawDialect || 'mysql');

const tempDir = os.tmpdir();
const sqliteStoragePath = isProduction
  ? path.join(tempDir, 'finvista_database.sqlite')
  : path.join(__dirname, '../database.sqlite');

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
  if (!fs.existsSync(path.dirname(sqliteStoragePath))) {
    fs.mkdirSync(path.dirname(sqliteStoragePath), { recursive: true });
  }
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStoragePath,
    logging: false,
    define: { timestamps: true, underscored: true }
  });
}

const connectDB = async () => {
  if (dialect === 'mysql') {
    try {
      const connection = await mysql.createConnection({ host, port, user, password, connectTimeout: 3000 });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
      await connection.end();
      console.log(`[Database] MySQL schema \`${database}\` verified/created.`);

      await sequelize.authenticate();
      console.log(`[Database] Sequelize connected successfully via MySQL dialect.`);
    } catch (error) {
      console.warn(`[Database] MySQL connection failed (${error.message}).`);
      throw error;
    }
  } else {
    await sequelize.authenticate();
    console.log(`[Database] SQLite connected successfully at ${sqliteStoragePath}.`);
  }
};

module.exports = {
  sequelize,
  connectDB
};
