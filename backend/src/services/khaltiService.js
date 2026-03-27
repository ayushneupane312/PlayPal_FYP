const axios = require('axios');

function getConfig() {
  const secretKey = process.env.KHALTI_SECRET_KEY;
  const baseUrl = process.env.KHALTI_BASE_URL || 'https://a.khalti.com/api/v2';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!secretKey) {
    const err = new Error('KHALTI_SECRET_KEY is missing in backend .env');
    err.code = 'KHALTI_NOT_CONFIGURED';
    throw err;
  }

  return { secretKey, baseUrl, frontendUrl };
}

function khaltiHeaders(secretKey) {
  return {
    Authorization: `Key ${secretKey}`,
    'Content-Type': 'application/json'
  };
}

function convertToPaisa(amountRupees) {
  const n = Number(amountRupees);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function convertToRupees(amountPaisa) {
  const n = Number(amountPaisa);
  if (!Number.isFinite(n)) return 0;
  return n / 100;
}

/**
 * Initiate Khalti ePayment.
 * Expects payload keys as per Khalti: returnUrl, websiteUrl, purchaseOrderId, purchaseOrderName, amount (paisa), customerInfo.
 */
async function initiatePayment({
  returnUrl,
  websiteUrl,
  purchaseOrderId,
  purchaseOrderName,
  amount,
  customerInfo
}) {
  const { secretKey, baseUrl, frontendUrl } = getConfig();

  const return_url = returnUrl || `${frontendUrl}/payment/callback`;
  const website_url = websiteUrl || frontendUrl;

  if (!purchaseOrderId || !purchaseOrderName) {
    const err = new Error('purchaseOrderId and purchaseOrderName are required');
    err.code = 'KHALTI_BAD_REQUEST';
    throw err;
  }

  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt < 1000) {
    const err = new Error('Minimum amount is Rs. 10 (1000 paisa)');
    err.code = 'KHALTI_MIN_AMOUNT';
    throw err;
  }

  const payload = {
    return_url,
    website_url,
    amount: amt,
    purchase_order_id: String(purchaseOrderId),
    purchase_order_name: String(purchaseOrderName),
    customer_info: customerInfo || undefined
  };

  const { data } = await axios.post(`${baseUrl}/epayment/initiate/`, payload, {
    headers: khaltiHeaders(secretKey)
  });

  // Khalti returns: { pidx, payment_url, expires_at, expires_in, ... }
  return {
    pidx: data?.pidx,
    paymentUrl: data?.payment_url,
    expiresAt: data?.expires_at,
    expiresIn: data?.expires_in,
    raw: data
  };
}

async function verifyPayment(pidx) {
  const { secretKey, baseUrl } = getConfig();

  if (!pidx) {
    const err = new Error('pidx is required');
    err.code = 'KHALTI_BAD_REQUEST';
    throw err;
  }

  const { data } = await axios.post(
    `${baseUrl}/epayment/lookup/`,
    { pidx: String(pidx) },
    { headers: khaltiHeaders(secretKey) }
  );

  const status = data?.status;
  return {
    verified: status === 'Completed',
    pending: status === 'Pending',
    failed: status && status !== 'Completed' && status !== 'Pending',
    status,
    transactionId: data?.transaction_id,
    amount: data?.total_amount,
    fee: data?.fee,
    refunded: data?.refunded,
    data
  };
}

module.exports = {
  initiatePayment,
  verifyPayment,
  convertToPaisa,
  convertToRupees
};

