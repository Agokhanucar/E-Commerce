const invoiceRepository = require('../repositories/InvoiceRepository');
const { producer } = require('../config/kafka');
const { redisClient } = require('../config/redis');

class BillingService {
  static async generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const lastNumber = await redisClient.incr('invoice_sequence');
    return `INV-${year}${month}-${String(lastNumber).padStart(5, '0')}`;
  }

  static async createInvoice(paymentData, kafkaProducer) {
    try {
      // Redis'te kontrol
      const existingInvoice = await redisClient.get(`invoice:${paymentData.orderId}`);
      if (existingInvoice) {
        console.log('Invoice already exists in Redis:', paymentData.orderId);
        return;
      }

      // MongoDB'de kontrol
      const dbInvoice = await invoiceRepository.findByOrderId(paymentData.orderId);
      if (dbInvoice) {
        console.log('Invoice already exists in DB:', paymentData.orderId);
        return;
      }

      const invoiceNumber = await this.generateInvoiceNumber();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoiceData = {
        orderId: paymentData.orderId,
        userId: paymentData.userId,
        paymentId: paymentData._id,
        items: paymentData.orderItems,
        subtotal: paymentData.amount - (paymentData.amount * 0.18),
        tax: paymentData.amount * 0.18,
        total: paymentData.amount,
        status: 'issued',
        invoiceNumber: invoiceNumber,
        dueDate: dueDate
      };

      // MongoDB'ye kaydet
      const invoice = await invoiceRepository.create(invoiceData);

      // Redis'e kaydet
      await redisClient.setEx(
        `invoice:${paymentData.orderId}`,
        process.env.REDIS_TTL,
        JSON.stringify(invoice)
      );

      await kafkaProducer.send({
        topic: 'invoice-created',
        messages: [{ 
          key: paymentData.orderId,
          value: JSON.stringify(invoice)
        }]
      });

      console.log('Invoice created successfully:', invoice.invoiceNumber);
    } catch (error) {
      console.error('Invoice creation error:', error);

      await kafkaProducer.send({
        topic: 'invoice-error',
        messages: [{ 
          key: paymentData.orderId,
          value: JSON.stringify({
            orderId: paymentData.orderId,
            error: error.message
          })
        }]
      });
    }
  }
}

module.exports = BillingService;