import express from "express"
import { Router } from "express"
import { getCurrentUser } from "../controllers/user.js"
import { middleware } from "../middleware/middleware.js";

const userRouter = Router();


userRouter.get("/me", middleware, getCurrentUser)

export default userRouter;