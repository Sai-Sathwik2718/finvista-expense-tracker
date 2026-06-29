const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { errorResponse } = require('./utils/apiResponse');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes',
    data: null,
    errors: null
  }
});
app.use('/api/', limiter);

// Request Parsing & Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Enterprise Expense Tracker API is running smoothly' });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  return errorResponse(res, 404, `Route ${req.originalUrl} not found`);
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server & Sync DB
const startServer = async () => {
  try {
    await connectDB();
    // Sync models with database schema
    await sequelize.sync({ alter: false });
    console.log('[Database] Models synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Server listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
