const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');
const os = require('os');
const fs = require('fs');
require('dotenv').config();

const isProduction = !!(process.env.VERCEL || process.env.NODE_ENV === 'production');
const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

let sequelize;
let dialect = process.env.DB_DIALECT || 'mysql';
let host = process.env.DB_HOST || 'localhost';
let port = process.env.DB_PORT || 3306;
let user = process.env.DB_USER || 'root';
let password = process.env.DB_PASS || process.env.DB_PASSWORD || '';
let database = process.env.DB_NAME || 'expense_tracker_db';

const tempDir = os.tmpdir();
const sqliteStoragePath = isProduction
  ? path.join(tempDir, 'finvista_production.sqlite')
  : path.join(__dirname, '../database.sqlite');

class MemoryInstance {
  constructor(model, values = {}) {
    this._model = model;
    this._values = { ...values };
    Object.assign(this, values);
  }

  get(key) {
    if (key) return this._values[key];
    return { ...this._values };
  }

  async update(values = {}) {
    const hooks = this._model.options?.hooks || {};
    if (hooks.beforeUpdate) {
      await hooks.beforeUpdate(this);
    }
    Object.assign(this._values, values);
    Object.assign(this, values);
    return this;
  }

  async destroy() {
    this._model._records = (this._model._records || []).filter((record) => record !== this);
    return true;
  }
}

class MemoryModel {
  constructor(values = {}) {
    this._values = { ...values };
    Object.assign(this, values);
  }

  static hasMany() {
    return this;
  }

  static belongsTo() {
    return this;
  }

  get(key) {
    if (key) return this._values[key];
    return { ...this._values };
  }

  async update(values = {}) {
    const hooks = this.constructor.options?.hooks || {};
    if (hooks.beforeUpdate) {
      await hooks.beforeUpdate(this);
    }
    Object.assign(this._values, values);
    Object.assign(this, values);
    return this;
  }

  async destroy() {
    this.constructor._records = (this.constructor._records || []).filter((record) => record !== this);
    return true;
  }

  static async create(values = {}) {
    const hooks = this.options?.hooks || {};
    if (hooks.beforeCreate) {
      await hooks.beforeCreate(values);
    }

    const instance = new this(values);
    this._records = this._records || [];
    this._records.push(instance);
    return instance;
  }

  static async bulkCreate(valuesList = []) {
    return Promise.all(valuesList.map((values) => this.create(values)));
  }

  static async findByPk(id) {
    return (this._records || []).find((record) => record.get('id') === id) || null;
  }

  static async findOne(options = {}) {
    const records = this._records || [];
    const where = options.where || {};
    const filtered = records.filter((record) => this._matchesWhere(record, where));
    const item = filtered[0] || null;
    if (!item) return null;

    const attrs = options.attributes;
    if (Array.isArray(attrs) && attrs[0] && Array.isArray(attrs[0]) && attrs[0][0]?.type === 'fn' && attrs[0][0]?.fn === 'SUM') {
      const total = filtered.reduce((sum, record) => sum + parseFloat(record.get('amount') || 0), 0);
      return new this({ total });
    }

    return item;
  }

  static async findAll(options = {}) {
    const records = (this._records || []).filter((record) => this._matchesWhere(record, options.where || {}));
    const sorted = this._sortRecords(records, options.order);
    if (options.include && options.include.length > 0) {
      return sorted.map((record) => this._attachIncludes(record, options.include));
    }
    return sorted.slice(0, options.limit || sorted.length);
  }

  static async findAndCountAll(options = {}) {
    const records = (this._records || []).filter((record) => this._matchesWhere(record, options.where || {}));
    const sorted = this._sortRecords(records, options.order);
    const rows = sorted.slice(options.offset || 0, (options.offset || 0) + (options.limit || sorted.length));
    return { count: sorted.length, rows };
  }

  static async count(options = {}) {
    return (this._records || []).filter((record) => this._matchesWhere(record, options.where || {})).length;
  }

  static async sync() {
    return true;
  }

  static async authenticate() {
    return true;
  }

  static _matchesWhere(record, where = {}) {
    if (!where || Object.keys(where).length === 0) return true;
    return Object.entries(where).every(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (value[Object.keys(value)[0]] !== undefined) {
          const operator = Object.keys(value)[0];
          const target = value[operator];
          const actual = record.get(key);
          switch (operator) {
            case '$like':
              return String(actual).includes(String(target).replace(/%/g, ''));
            case '$between':
              return actual >= target[0] && actual <= target[1];
            case '$gte':
              return actual >= target;
            case '$lte':
              return actual <= target;
            default:
              return actual === value;
          }
        }
      }
      return record.get(key) === value;
    });
  }

  static _sortRecords(records, order = []) {
    if (!order || order.length === 0) return records;
    const [field, direction = 'ASC'] = order[0];
    return [...records].sort((a, b) => {
      const left = a.get(field);
      const right = b.get(field);
      if (left === right) return 0;
      return direction.toUpperCase() === 'DESC' ? (left > right ? -1 : 1) : (left > right ? 1 : -1);
    });
  }

  static _attachIncludes(record, includes = []) {
    const attached = record;
    includes.forEach((include) => {
      const Model = include.model;
      if (Model && record.get('category_id')) {
        const related = Model.findByPk ? Model.findByPk(record.get('category_id')) : null;
        attached[Model.name] = related;
      }
    });
    return attached;
  }
}

class MemorySequelize {
  constructor() {
    this.models = {};
    this.isMemory = true;
  }

  define(name, attributes, options = {}) {
    const Model = class extends MemoryModel {};
    Object.defineProperty(Model, 'name', {
      value: name,
      configurable: true
    });
    Model.attributes = attributes;
    Model.options = options;
    Model._records = [];
    Model._idCounter = 1;
    Model.sequelize = this;
    this.models[name] = Model;
    return Model;
  }

  fn(name, ...args) {
    return { type: 'fn', fn: name, args };
  }

  col(name) {
    return { type: 'col', col: name };
  }

  literal(sql) {
    return { type: 'literal', sql };
  }

  async authenticate() {
    if (!this.models.User) return true;
    const User = this.models.User;
    const existing = await User.findOne({ where: { email: 'alex@enterprise.io' } });
    if (!existing) {
      await User.create({
        name: 'Alex Enterprise',
        email: 'alex@enterprise.io',
        password: 'password123'
      });
    }
    this._seeded = true;
    return true;
  }

  async sync() {
    return true;
  }
}

const createSqliteInstance = () => {
  if (!fs.existsSync(path.dirname(sqliteStoragePath))) {
    fs.mkdirSync(path.dirname(sqliteStoragePath), { recursive: true });
  }

  return new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStoragePath,
    logging: false,
    define: { timestamps: true, underscored: true }
  });
};

const createMemoryInstance = () => new MemorySequelize();

if (dbUrl) {
  console.log('[Database] Initializing via cloud DATABASE_URL connection string...');
  sequelize = new Sequelize(dbUrl, {
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'false' ? false : {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: { timestamps: true, underscored: true }
  });
  dialect = sequelize.getDialect();
} else if (isProduction || !process.env.DB_HOST) {
  console.log('[Database] No external database configured. Using memory store for serverless deployment.');
  dialect = 'memory';
  sequelize = createMemoryInstance();
} else if (dialect === 'mysql') {
  console.log(`[Database] Configuring MySQL -> Host: ${host}:${port}, User: ${user}, Database: ${database}`);
  sequelize = new Sequelize(database, user, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false
    },
    define: { timestamps: true, underscored: true }
  });
} else {
  console.log(`[Database] Configuring SQLite Cloud Storage -> ${sqliteStoragePath}`);
  try {
    sequelize = createSqliteInstance();
  } catch (error) {
    console.warn(`[Database] SQLite unavailable (${error.message}). Falling back to memory store.`);
    sequelize = createMemoryInstance();
    dialect = 'memory';
  }
}

const connectDB = async () => {
  try {
    if (dialect === 'mysql' && !dbUrl) {
      try {
        const connection = await mysql.createConnection({
          host,
          port,
          user,
          password,
          connectTimeout: 4000,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();
        await sequelize.authenticate();
        console.log(`[Database] Sequelize connected successfully to MySQL host ${host}.`);
      } catch (error) {
        console.warn(`[Database] MySQL unavailable (${error.message}). Falling back to memory store.`);
        sequelize = createMemoryInstance();
        dialect = 'memory';
        await sequelize.authenticate();
      }
    } else if (sequelize && typeof sequelize.authenticate === 'function') {
      await sequelize.authenticate();
    }

    console.log(`[Database] Database connected successfully via ${dialect}.`);
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB
};
