import express, { type Request, type Response , Router } from "express"
import { PrismaClient } from "@prisma/client"
import { middleware } from "../middleware/middleware.js"
const prisma = new PrismaClient()


export const createCampaign = async(req: Request, res: Response) =>{
       const { title , description } = req.body
       //@ts-ignore
       const userId = req.userId

       try{
        // Generate a unique share link for the campaign
        const shareLink = `${req.protocol}://${req.get('host')}/campaign/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const newCampaign = await prisma.campaign.create({
            data: {
                title ,
                description ,
                shareLink,
                userId 
            }
        })

        res.status(201).json({newCampaign})
        
       }catch(error){
        console.log(error)
        res.status(500).json({message: "Internal server error"})
       }
}


export const deleteCampaign = async(req: Request, res: Response) =>{
    const { campaignId } = req.body
    //@ts-ignore
    const userId = req.userId
    try{
        const deletedCampaign = await prisma.campaign.delete({
            where: { id: campaignId as string , userId: userId as string }
        })
        res.status(200).json({deletedCampaign})
    }catch(error){
        console.log(error)
        res.status(500).json({message: "Failed to delete campaign"})
    }
}


export const getCampaigns = async(req: Request, res: Response) =>{
    //@ts-ignore
    const userId = req.userId
    try{
        const campaigns = await prisma.campaign.findMany({
            where: { userId: userId as string }
        })
        res.status(200).json({campaigns})
    }catch(error){
        console.log(error)
        res.status(500).json({message: "Failed to get campaigns"})
    }
}

export const editCampaign = async(req: Request, res: Response) =>{
    const { campaignId , title , description } = req.body
    //@ts-ignore
    const userId = req.userId
    try{
        const editedCampaign = await prisma.campaign.update({
            where: { id: campaignId as string , userId: userId as string },
            data: { title , description }
        })
        res.status(200).json({editedCampaign})
    }catch(error){
        console.log(error)
        res.status(500).json({message: "Failed to edit campaign"})
    }
}   
