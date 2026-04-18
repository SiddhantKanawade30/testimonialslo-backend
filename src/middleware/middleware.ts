import type {Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export const middleware = async(req:Request, res:Response, next: NextFunction) =>{
    const token = req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({message: "No token provided"})
    }

    try{
        const decodedToken = jwt.verify(token as string,process.env.JWT_SECRET as string)
        //@ts-ignore
        req.userId = decodedToken.userId
        next()
    }catch(e){
        console.error("Token validation failed:", e)
        res.status(401).json({ message: "Invalid or expired token" })
    }
}