import  express  from "express"
import type { Request, Response, NextFunction } from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import userRouter from "./routes/user.js"
import campaignRouter from "./routes/campaign.js"
import testimonialRouter from "./routes/testimonial.js"
import authRouter from "./routes/auth.js"

const app = express()
const PORT = process.env.PORT

app.use(express.json());
app.use(cors());


app.use("/api/v1/auth", authRouter)
app.use("/api/v1/campaigns", campaignRouter)
app.use("/api/v1/testimonials", testimonialRouter)
app.use("/api/v1/user", userRouter)



app.listen(PORT, () => console.log(`backend server running on port: ${PORT}`))