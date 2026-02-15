import axios from "axios";
import Booking from "../models/BookingModel";

export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, bookingId } = req.body;

    if (!pidx || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "Missing pidx or bookingId"
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Prevent double verification
    if (booking.payment?.status === "paid") {
      return res.json({ success: true, booking });
    }

    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: `Payment ${response.data.status}`
      });
    }

    if (response.data.total_amount !== booking.pricing.totalAmount * 100) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch"
      });
    }

    booking.payment = {
      status: "paid",
      method: "khalti",
      pidx,
      paidAt: new Date()
    };

    booking.bookingStatus = "confirmed";

    await booking.save();

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error("Khalti verification error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};
