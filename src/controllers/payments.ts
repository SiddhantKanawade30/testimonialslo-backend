import { PrismaClient } from "@prisma/client";
import express, { type Request, type Response } from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
const prisma = new PrismaClient();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error(
    "Razorpay credentials are not configured in environment variables"
  );
}

var instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const receipt = `rcpt_${userId.slice(0, 20)}_${timestamp}`;

    var options = {
      amount: 100,
      currency: "INR",
      receipt: receipt,
      notes: {
        userId: userId,
        planType: "premium",
      },
    };

    const order = await instance.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      name: user?.name,
      email: user?.email,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Fetch payment details for additional verification
    const payment = await instance.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment not captured",
      });
    }

    // Update user to premium
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: "PREMIUM",
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        // Add payment history if you have a separate table
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    res.json({
      success: true,
      message: "Payment verified and plan upgraded successfully",
      plan: user.plan,
      expiresAt: user.planExpiresAt,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
