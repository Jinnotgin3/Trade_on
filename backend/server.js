const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: '../.env' });

const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const outreachRoutes = require('./routes/outreachRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default, or set via env
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// HTTP Request logger using Morgan and Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error(`MongoDB connection error: ${err.message}`));

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', tradeRoutes);
app.use('/api', outreachRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
