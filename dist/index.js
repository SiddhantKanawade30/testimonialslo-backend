import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRouter from "./routes/user.js";
import campaignRouter from "./routes/campaign.js";
import testimonialRouter from "./routes/testimonial.js";
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
    res.send("hello world");
});
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/campaigns", campaignRouter);
app.use("/api/v1/testimonials", testimonialRouter);
app.listen(PORT, () => console.log(`backend server running on port: ${PORT}`));
//# sourceMappingURL=index.js.map