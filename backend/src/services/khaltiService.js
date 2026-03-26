const axios = require('axios');

class KhaltiService {
  constructor() {
    this.secretKey = process.env.KHALTI_SECRET_KEY;
    // Sandbox vs live must match your key type. Override explicitly if needed (e.g. live key while NODE_ENV is not production).
    this.baseURL =
      process.env.KHALTI_API_BASE_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://khalti.com/api/v2'
        : 'https://a.khalti.com/api/v2');
  }

  /**
   * Initiate Khalti payment (KPG-2 Web Checkout)
   * @param {Object} paymentData - Payment details
   * @returns {Promise} Payment initiation response with pidx
   */
  async initiatePayment(paymentData) {
    try {
      if (!this.secretKey || !String(this.secretKey).trim()) {
        throw {
          success: false,
          message:
            'Khalti is not configured: set KHALTI_SECRET_KEY in the backend .env file.',
          error_key: 'config_error'
        };
      }

      const {
        amount,           // Amount in paisa (Rs 100 = 10000 paisa)
        purchaseOrderId,  // Unique order ID
        purchaseOrderName,
        customerInfo,
        returnUrl,
        websiteUrl,
        amountBreakdown,
        productDetails
      } = paymentData;

      // Validate minimum amount (Rs 10 = 1000 paisa)
      if (amount < 1000) {
        throw {
          success: false,
          message: 'Amount should be greater than Rs. 10, that is 1000 paisa.',
          error_key: 'validation_error'
        };
      }

      const payload = {
        return_url: returnUrl || `${process.env.FRONTEND_URL}/booking/payment-callback`,
        website_url: websiteUrl || process.env.FRONTEND_URL,
        amount: amount,  // Amount in paisa
        purchase_order_id: purchaseOrderId,
        purchase_order_name: purchaseOrderName,
        customer_info: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone
        }
      };

      // Add optional fields if provided
      if (amountBreakdown && amountBreakdown.length > 0) {
        payload.amount_breakdown = amountBreakdown;
      }

      if (productDetails && productDetails.length > 0) {
        payload.product_details = productDetails;
      }

      console.log('🔵 Khalti Payment Initiation Request:', {
        ...payload,
        customer_info: { ...payload.customer_info, phone: '98XXXXX' + payload.customer_info.phone.slice(-3) }
      });

      const response = await axios.post(
        `${this.baseURL}/epayment/initiate/`,
        payload,
        {
          headers: {
            'Authorization': `Key ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Khalti Initiation Success:', {
        pidx: response.data.pidx,
        expires_at: response.data.expires_at,
        expires_in: response.data.expires_in
      });

      return {
        success: true,
        data: response.data,
        pidx: response.data.pidx,
        paymentUrl: response.data.payment_url,
        expiresAt: response.data.expires_at,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      console.error('❌ Khalti Initiation Error:', error.response?.data || error.message);
      
      // Handle specific validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        throw {
          success: false,
          message: errorData.detail || this.formatValidationErrors(errorData),
          error: errorData,
          error_key: errorData.error_key || 'payment_error'
        };
      }

      throw {
        success: false,
        message: error.message || 'Payment initiation failed',
        error: error
      };
    }
  }

  /**
   * Verify Khalti payment using Lookup API
   * @param {string} pidx - Payment index from Khalti
   * @returns {Promise} Payment verification response
   */
  async verifyPayment(pidx) {
    try {
      console.log('🔍 Verifying Khalti Payment (Lookup):', pidx);

      const response = await axios.post(
        `${this.baseURL}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            'Authorization': `Key ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Khalti Lookup Response:', response.data);

      const paymentData = response.data;

      // Determine if payment is verified based on status
      const isVerified = paymentData.status === 'Completed';
      const isPending = paymentData.status === 'Pending';
      const isFailed = ['User canceled', 'Expired', 'Failed'].includes(paymentData.status);

      return {
        success: true,
        verified: isVerified,
        pending: isPending,
        failed: isFailed,
        data: paymentData,
        status: paymentData.status,
        amount: paymentData.total_amount,
        transactionId: paymentData.transaction_id,
        fee: paymentData.fee,
        refunded: paymentData.refunded
      };
    } catch (error) {
      console.error('❌ Khalti Lookup Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw {
          success: false,
          message: 'Invalid Khalti authorization token',
          error: error.response.data
        };
      }

      if (error.response?.status === 404) {
        throw {
          success: false,
          message: 'Payment not found. Invalid pidx.',
          error: error.response.data
        };
      }

      throw {
        success: false,
        message: error.response?.data?.detail || 'Payment verification failed',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get payment status (wrapper for verifyPayment)
   * @param {string} pidx - Payment index
   * @returns {Promise} Payment status
   */
  async getPaymentStatus(pidx) {
    try {
      const verification = await this.verifyPayment(pidx);
      return {
        success: true,
        status: verification.status,
        verified: verification.verified,
        pending: verification.pending,
        failed: verification.failed
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        verified: false,
        pending: false,
        failed: true,
        error: error.message
      };
    }
  }

  /**
   * Format validation errors from Khalti API
   * @param {Object} errorData - Error data from Khalti
   * @returns {string} Formatted error message
   */
  formatValidationErrors(errorData) {
    if (errorData.return_url) return errorData.return_url[0];
    if (errorData.website_url) return errorData.website_url[0];
    if (errorData.amount) return errorData.amount[0];
    if (errorData.purchase_order_id) return errorData.purchase_order_id[0];
    if (errorData.purchase_order_name) return errorData.purchase_order_name[0];
    return 'Validation error occurred';
  }

  /**
   * Convert rupees to paisa
   * @param {number} rupees - Amount in rupees
   * @returns {number} Amount in paisa
   */
  convertToPaisa(rupees) {
    return Math.round(rupees * 100);
  }

  /**
   * Convert paisa to rupees
   * @param {number} paisa - Amount in paisa
   * @returns {number} Amount in rupees
   */
  convertToRupees(paisa) {
    return paisa / 100;
  }

  /**
   * Check if payment status is successful
   * @param {string} status - Payment status from Khalti
   * @returns {boolean} True if payment is successful
   */
  isPaymentSuccessful(status) {
    return status === 'Completed';
  }

  /**
   * Check if payment status is failed
   * @param {string} status - Payment status from Khalti
   * @returns {boolean} True if payment failed
   */
  isPaymentFailed(status) {
    return ['User canceled', 'Expired', 'Failed'].includes(status);
  }

  /**
   * Check if payment is pending
   * @param {string} status - Payment status from Khalti
   * @returns {boolean} True if payment is pending
   */
  isPaymentPending(status) {
    return ['Pending', 'Initiated'].includes(status);
  }
}

module.exports = new KhaltiService();
