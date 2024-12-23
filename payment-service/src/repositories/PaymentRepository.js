const Payment = require('../models/Payment');

class PaymentRepository {
  async findByOrderId(orderId) {
    return await Payment.findOne({ orderId });
  }

  async create(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async updateStatus(paymentId, status) {
    return await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );
  }

  async getPaymentHistory(userId) {
    return await Payment.find({ userId }).sort({ createdAt: -1 });
  }
}

module.exports = new PaymentRepository(); 