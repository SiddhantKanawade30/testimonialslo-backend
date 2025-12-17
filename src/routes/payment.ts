import { Router } from "express";
import { middleware } from "../middleware/middleware.js";
import { createOrder , verifyPayment} from "../controllers/payments.js";


export const paymentRouter = Router();

paymentRouter.post("/create-order",middleware, createOrder)
paymentRouter.post("/verify-payment",middleware, verifyPayment )