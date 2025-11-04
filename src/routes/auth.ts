
import { signup, signin, googleAuth } from "../controllers/auth.js"
import { Router } from "express"

const authRouter = Router();

authRouter.post("/signup", signup)
authRouter.post("/signin", signin)
authRouter.post("/google", googleAuth)

export default authRouter;