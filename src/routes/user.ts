import express from "express"
import { Router } from "express"
import { signup, signin } from "../controllers/auth.js"


export const userRouter = Router();

userRouter.post("/signup", signup)
userRouter.post("/signin", signin)