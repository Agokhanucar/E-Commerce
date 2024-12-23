require('dotenv').config();
const { initKafka } = require('./src/config/kafka');
const { initRedis } = require('./src/config/redis');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI_PAYMENT)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Kafka and Redis
const initializeServices = async () => {
  try {
    await initKafka();
    console.log('Kafka initialized');
    
    await initRedis();
    console.log('Redis initialized');
  } catch (error) {
    console.error('Service initialization error:', error);
    process.exit(1);
  }
};

initializeServices();

console.log(`Payment service started`);
console.log(`Environment: ${process.env.NODE_ENV}`); 