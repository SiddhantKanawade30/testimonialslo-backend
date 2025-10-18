import express from "express"
import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export const signup = async(req: Request, res: Response, next: NextFunction) =>{
    const {name , email , password } = req.body

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
            res.json({
                message : "user does not exist in our database"
            })
            return
        }

        const decodedPassword = bcrypt.compare(user.password, password)

        if(!decodedPassword){
            res.json({
                message : "incorrect password"
            })
            return
        }

        const token =  jwt.sign({userId : user.id}, JWT_SECRET as string, {expiresIn: "1h"})

        res.json({
            message : "signin successful",
            token
        })

    }catch(e){

        res.send("something went wrong")
        console.log(e)
    }
}