const axios = require('axios');
require('dotenv').config();

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

// ─── Initiate Payment ────────────────────────────────────────────────────────
const initiatePayment = async (req, res) => {
  try {
    const { amount, purchase_order_id, purchase_order_name, customer_info } =
      req.body;

    if (!KHALTI_SECRET_KEY || !KHALTI_BASE_URL || !FRONTEND_URL) {
      return res.status(500).json({
        success: false,
        message: 'Khalti env is not configured (KHALTI_SECRET_KEY, KHALTI_BASE_URL, FRONTEND_URL)'
      });
    }

    // Basic validation
    if (!amount || !purchase_order_id || !purchase_order_name) {
      return res.status(400).json({
        success: false,
        message:
          "amount, purchase_order_id, and purchase_order_name are required",
      });
    }

    if (amount < 1000) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount is NPR 10 (1000 paisa)",
      });
    }

    const payload = {
      return_url: `${FRONTEND_URL}/payment/callback`,
      website_url: FRONTEND_URL,
      amount, // in paisa
      purchase_order_id,
      purchase_order_name,
      customer_info: customer_info || {},
    };

    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data,
      // response.data = { pidx, payment_url, expires_at, expires_in }
    });
  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error("Khalti initiate error:", errData);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: errData,
    });
  }
};

// ─── Verify Payment ───────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!KHALTI_SECRET_KEY || !KHALTI_BASE_URL) {
      return res.status(500).json({
        success: false,
        message: 'Khalti env is not configured (KHALTI_SECRET_KEY, KHALTI_BASE_URL)'
      });
    }

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: "pidx is required",
      });
    }

    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { status, transaction_id, total_amount, fee, refunded } =
      response.data;

    if (status === "Completed") {
      // ✅ Update your DB order here if needed
      // e.g. await Order.findOneAndUpdate({ pidx }, { status: "paid", transaction_id })

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          status,
          transaction_id,
          total_amount,
          fee,
          refunded,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${status}`,
        data: { status },
      });
    }
  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error("Khalti verify error:", errData);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: errData,
    });
  }
};

module.exports = { initiatePayment, verifyPayment };