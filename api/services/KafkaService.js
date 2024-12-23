const { Kafka } = require('kafkajs');
const Order = require('../models/Order');

class KafkaService {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'api-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
    
    this.consumer = this.kafka.consumer({ 
      groupId: 'api-payment-group',
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    // Producer bağlantısını canlı tut
    this.keepAliveInterval = setInterval(async () => {
      try {
        await this.producer.connect();
      } catch (error) {
        console.error('Producer reconnection error:', error);
      }
    }, 5000);
  }

  async init() {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      await this.setupConsumers();
    } catch (error) {
      console.error('Kafka initialization error:', error);
      // Bağlantı hatası durumunda yeniden deneme
      setTimeout(() => this.init(), 5000);
    }
  }

  async setupConsumers() {
    // Payment completed consumer
    await this.consumer.subscribe({ topic: 'payment-completed' });
    await this.consumer.subscribe({ topic: 'payment-failed' });
    await this.consumer.subscribe({ topic: 'invoice-created' });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        switch(topic) {
          case 'payment-completed':
            await this.handlePaymentCompleted(message);
            break;
          case 'payment-failed':
            await this.handlePaymentFailed(message);
            break;
          case 'invoice-created':
            await this.handleInvoiceCreated(message);
            break;
        }
      }
    });
  }

  async handlePaymentCompleted(message) {
    try {
      const payment = JSON.parse(message.value.toString());
      const order = await Order.findById(payment.orderId);
      
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: payment._id,
          status: payment.status,
          update_time: payment.createdAt
        };
        await order.save();
        console.log(`Order ${order._id} payment completed`);
      }
    } catch (error) {
      console.error('Payment completion handling error:', error);
    }
  }

  async handlePaymentFailed(message) {
    try {
      const payment = JSON.parse(message.value.toString());
      const order = await Order.findById(payment.orderId);
      
      if (order) {
        order.paymentResult = {
          id: payment._id,
          status: 'failed',
          update_time: payment.createdAt
        };
        await order.save();
        console.log(`Order ${order._id} payment failed`);
      }
    } catch (error) {
      console.error('Payment failure handling error:', error);
    }
  }

  async handleInvoiceCreated(message) {
    try {
      const invoice = JSON.parse(message.value.toString());
      const order = await Order.findById(invoice.orderId);
      
      if (order) {
        order.invoiceNumber = invoice.invoiceNumber;
        order.invoiceStatus = 'issued';
        await order.save();
        console.log(`Order ${order._id} invoice created: ${invoice.invoiceNumber}`);
      }
    } catch (error) {
      console.error('Invoice creation handling error:', error);
    }
  }

  async publishOrderCreated(order) {
    try {
      await this.producer.connect();

      await this.producer.send({
        topic: 'order-created',
        messages: [{ 
          key: order._id.toString(),
          value: JSON.stringify(order)
        }]
      });
      console.log(`Order created event published for order: ${order._id}`);
    } catch (error) {
      console.error('Order creation publishing error:', error);
      // Hata durumunda yeniden deneme
      setTimeout(() => this.publishOrderCreated(order), 5000);
    }
  }
}

// Singleton instance
const kafkaService = new KafkaService();
module.exports = kafkaService;