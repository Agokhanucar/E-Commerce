const { Kafka } = require('kafkajs');

// Create Kafka instance
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'payment-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'], // Changed to localhost for local development
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Create producer and consumer instances
const producer = kafka.producer();
const consumer = kafka.consumer({ 
  groupId: process.env.KAFKA_GROUP_ID || 'payment-group',
  retry: {
    initialRetryTime: 100,
    retries: 8 
  }
});

// Initialize Kafka connections and subscriptions
const initKafka = async () => {
  try {
    await producer.connect();
    console.log('Producer connected');
    
    await consumer.connect();
    console.log('Consumer connected');

    // Subscribe to order-created topic
    await consumer.subscribe({ topic: 'order-created' });
    console.log('Order created topic subscribed');
    
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const order = JSON.parse(message.value.toString());
          console.log('Payment processing started for order:', order._id);
          
          // Import PaymentService here to avoid circular dependency
          const PaymentService = require('../services/PaymentService');
          await PaymentService.processPayment(order);
        } catch (error) {
          console.error('Payment processing error:', error);
          throw error;
        }
      }
    });
  } catch (error) {
    console.error('Kafka initialization error:', error);
    // Retry connection after delay
    setTimeout(() => initKafka(), 5000);
  }
};

// Export initialized producer and initKafka function
let kafkaProducer = null;

const getProducer = () => {
  if (!kafkaProducer) {
    kafkaProducer = producer;
  }
  return kafkaProducer;
};

module.exports = { producer: getProducer(), initKafka };