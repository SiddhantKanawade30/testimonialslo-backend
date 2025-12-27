import express from "express"
import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async(req: Request, res: Response, next: NextFunction) =>{
    const {name , email , password } = req.body

    if(!name || !email || !password){
        return res.status(400).json({message: "Name, email and password are required"})
    }

    const hashedPassword = await bcrypt.hash(password,5)

    try{

        const existingUser = await prisma.user.findUnique({
            where:{
                email
            }
        })

        if(existingUser){
            return res.status(400).json({message: "User already exists"})
        }

        const user = await prisma.user.create({
            data:{
             name ,
             email,
             password: hashedPassword
            }
        })

        res.status(201).json({user})

    }catch(error){
        next(error)
    }
}

export const signin = async(req:Request, res: Response) =>{

    const {email, password } = req.body

    try{
        const user = await prisma.user.findUnique({
            where : {
                email
            }
        })

        if(!user){
            res.status(400).json({
                message : "user does not exist in our database"
            })
            return
        }

        const decodedPassword = await bcrypt.compare(user.password as string, password)

        if(!decodedPassword){
            res.status(400).json({
                message : "Incorrect credentials"
            })
            return
        }

        const token =  jwt.sign({userId : user.id}, JWT_SECRET as string)

        res.status(200).json({
            message : "signin successful",
            token
        })

    }catch(e){

        res.status(500).json({
            message : "something went wrong"
        })
    }
}

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      return res.status(500).json({ error: "Google Client ID not configured" });
    }
    
    if (!JWT_SECRET) {
      return res.status(500).json({ error: "JWT Secret not configured" });
    }
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    const email = payload.email;
    const name = payload.name || payload.given_name || "";

    if (!email) {
      return res.status(400).json({ error: "Email not found in token" });
    }

    // Check if user exists, if not create one
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user with a unique password for Google OAuth users
      // Since password is unique in schema, we generate a unique random string
      const randomPassword = `google_oauth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const hashedPassword = await bcrypt.hash(randomPassword, 5);
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        }
      });
    } else {
      // Update user with latest info from Google (if name changed)
      if (name && name !== user.name) {
        user = await prisma.user.update({
          where: { email },
          data: {
            name: name,
          }
        });
      }
    }

    // generate JWT
    const customToken = jwt.sign({ userId: user.id, email, name }, JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.json({ token: customToken, user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(400).json({ error: "Invalid Google token", details: error instanceof Error ? error.message : "Unknown error" });
  }
};