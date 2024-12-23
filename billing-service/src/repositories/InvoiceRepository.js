const Invoice = require('../models/Invoice');

class InvoiceRepository {
  async findByOrderId(orderId) {
    return await Invoice.findOne({ orderId });
  }

  async create(invoiceData) {
    console.log('Invoice data:', invoiceData);
    const invoice = new Invoice(invoiceData);
    return await invoice.save();
  }

  async updateStatus(invoiceId, status) {
    return await Invoice.findByIdAndUpdate(
      invoiceId,
      { status },
      { new: true }
    );
  }

  async getInvoiceHistory(userId) {
    return await Invoice.find({ userId }).sort({ createdAt: -1 });
  }
}

module.exports = new InvoiceRepository(); 