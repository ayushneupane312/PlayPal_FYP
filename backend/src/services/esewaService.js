const crypto = require('crypto');
const axios = require('axios');

/**
 * eSewa ePay V2 — https://developer.esewa.com.np/pages/Epay-V2
 * Signature message: total_amount=X,transaction_uuid=Y,product_code=Z
 */
class EsewaService {
  constructor() {
    this.secretKey = process.env.ESEWA_SECRET_KEY;
    this.productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
    this.gatewayUrl =
      process.env.ESEWA_GATEWAY_URL ||
      'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    this.statusUrl =
      process.env.ESEWA_STATUS_URL ||
      'https://uat.esewa.com.np/api/epay/transaction/status/';
  }

  formatTotalAmount(totalAmount) {
    const n = Number(totalAmount);
    if (!Number.isFinite(n) || n < 0) return '0';
    if (Number.isInteger(n)) return String(Math.round(n));
    return n.toFixed(2);
  }

  signForInitiate(totalAmountStr, transactionUuid, productCode) {
    const message = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('base64');
  }

  assertConfigured() {
    if (!this.secretKey || !String(this.secretKey).trim()) {
      const err = new Error(
        'eSewa is not configured: set ESEWA_SECRET_KEY and ESEWA_PRODUCT_CODE in backend .env'
      );
      err.code = 'ESEWA_CONFIG';
      throw err;
    }
  }

  /**
   * Build POST fields for https://rc-epay.esewa.com.np/api/epay/main/v2/form
   */
  buildInitiateFields({ subtotal, transactionUuid, successUrl, failureUrl }) {
    this.assertConfigured();
    const amountStr = this.formatTotalAmount(subtotal);
    const tax = '0';
    const service = '0';
    const delivery = '0';
    const totalNum = Number(amountStr) + Number(tax) + Number(service) + Number(delivery);
    const totalStr = this.formatTotalAmount(totalNum);
    const signature = this.signForInitiate(totalStr, transactionUuid, this.productCode);
    return {
      fields: {
        amount: amountStr,
        tax_amount: tax,
        total_amount: totalStr,
        transaction_uuid: transactionUuid,
        product_code: this.productCode,
        product_service_charge: service,
        product_delivery_charge: delivery,
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature
      },
      totalAmountStr: totalStr
    };
  }

  async checkStatus(transactionUuid, totalAmountStr) {
    this.assertConfigured();
    const url = new URL(this.statusUrl);
    url.searchParams.set('product_code', this.productCode);
    url.searchParams.set('total_amount', totalAmountStr);
    url.searchParams.set('transaction_uuid', transactionUuid);
    const { data } = await axios.get(url.toString(), { timeout: 20000 });
    return data;
  }
}

module.exports = new EsewaService();
