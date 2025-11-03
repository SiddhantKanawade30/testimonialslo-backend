import express from "express"
import { Router } from "express"
import { signup, signin, googleAuth } from "../controllers/auth.js"

const userRouter = Router();

userRouter.post("/signup", signup)
userRouter.post("/signin", signin)
userRouter.post("/google", googleAuth)

export default userRouter;