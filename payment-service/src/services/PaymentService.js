const paymentRepository = require('../repositories/PaymentRepository');
const { producer } = require('../config/kafka');
const { redisClient } = require('../config/redis');

class PaymentService {
  static async processPayment(orderData) {
    try {
      // Redis'te ödeme kontrolü
      const existingPayment = await redisClient.get(`payment:${orderData._id}`);
      if (existingPayment) {
        console.log('Payment already processed:', orderData._id);
        return;
      }

      // MongoDB'de ödeme kontrolü
      const dbPayment = await paymentRepository.findByOrderId(orderData._id);
      if (dbPayment) {
        console.log('Payment already exists in DB:', orderData._id);
        return;
      }

      // Yeni ödeme oluştur
      const paymentData = {
        orderId: orderData._id,
        amount: orderData.totalPrice,
        userId: orderData.user,
        status: 'processing',
        orderItems: orderData.orderItems,
        paymentMethod: orderData.paymentMethod
      };

      // MongoDB'ye kaydet
      const payment = await paymentRepository.create(paymentData);

      // Ödeme simülasyonu
      const isPaymentSuccessful = Math.random() > 0.1; // %90 başarı oranı
      
      if (isPaymentSuccessful) {
        // Ödeme durumunu güncelle
        const updatedPayment = await paymentRepository.updateStatus(payment._id, 'completed');
        
        // Redis'e kaydet
        await redisClient.setEx(
          `payment:${orderData._id}`, 
          process.env.REDIS_TTL, 
          JSON.stringify(updatedPayment)
        );

        // Kafka'ya başarılı ödeme mesajı gönder
        await producer.send({
          topic: 'payment-completed',
          messages: [{ 
            key: orderData._id,
            value: JSON.stringify(updatedPayment)
          }]
        });

        console.log('Payment completed successfully:', orderData._id);
      } else {
        // Başarısız ödeme durumunu güncelle
        const failedPayment = await paymentRepository.updateStatus(payment._id, 'failed');
        
        // Kafka'ya başarısız ödeme mesajı gönder
        await producer.send({
          topic: 'payment-failed',
          messages: [{ 
            key: orderData._id,
            value: JSON.stringify(failedPayment)
          }]
        });

        console.log('Payment failed:', orderData._id);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      
      // Kafka'ya hata mesajı gönder
      await producer.send({
        topic: 'payment-error',
        messages: [{ 
          key: orderData._id,
          value: JSON.stringify({
            orderId: orderData._id,
            error: error.message
          })
        }]
      });
    }
  }
}

module.exports = PaymentService; 