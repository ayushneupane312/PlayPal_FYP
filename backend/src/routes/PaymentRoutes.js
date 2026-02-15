import express from "express";
import { verifyKhaltiPayment } from "../controllers/PaymentController.js";

const paymentrouter = express.Router();

paymentrouter.post("/khalti/verify", verifyKhaltiPayment);

export default pamymentrouter;
