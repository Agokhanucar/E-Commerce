const { Kafka } = require('kafkajs');
const BillingService = require('../services/BillingService');

const kafka = new Kafka({
  clientId: 'billing-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

const consumer = kafka.consumer({ 
  groupId: process.env.KAFKA_GROUP_ID || 'billing-group',
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const initializeKafka = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected successfully');
  } catch (error) {
    console.error('Error connecting to Kafka:', error);
    throw error;
  }
};

// İlk başlatma
initializeKafka();

const initKafka = async () => {
  try {
    await consumer.connect();
    console.log('Consumer connected');

    await consumer.subscribe({ topic: 'payment-completed' });
    console.log('Payment completed topic subscribed');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const paymentData = JSON.parse(message.value.toString());
          console.log('Invoice generation started for payment:', paymentData._id);
          
          // Pass producer instance to BillingService
          await BillingService.createInvoice(paymentData, producer);
          console.log('Invoice generated successfully for payment:', paymentData._id);
        } catch (error) {
          console.error('Invoice processing error:', error);
          // Re-throw error to trigger retry mechanism
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