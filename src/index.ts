import  express  from "express"
import type { Request, Response, NextFunction } from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import userRouter from "./routes/user.js"
import campaignRouter from "./routes/campaign.js"
import testimonialRouter from "./routes/testimonial.js"
import { paymentRouter } from "./routes/payment.js"
import authRouter from "./routes/auth.js"

const app = express()
const PORT = process.env.PORT

app.use(express.json());
app.use(cors());

console.log("Mounting routes...");

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/campaigns", campaignRouter)
app.use("/api/v1/testimonials", testimonialRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/payments", paymentRouter)


console.log("Routes mounted successfully");



app.listen(PORT, () => console.log(`backend server running on port: ${PORT}`))