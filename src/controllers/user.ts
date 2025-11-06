import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { all } from "axios";
const prisma = new PrismaClient()

export const getCurrentUser = async (req: Request, res: Response) => {
   
    try{
         //@ts-ignore
    const userId = req.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include:{
                campaigns: {
                    include:{ testimonials: true , _count: true }
                }
            }
        })

        const totalCampaigns = user?.campaigns.length;

        const totalTestimonials = user?.campaigns.reduce((acc,campaign)=>{
            return acc + campaign.testimonials.length;
        },0)     

        const remainingSpace = 5 - totalCampaigns!   

        const allTestimonials = user?.campaigns.flatMap(campaign => campaign.testimonials);
        const sortTestimonial = allTestimonials?.sort((a,b)=> b.rating - a.rating)


        res.status(200).json({ user, totalCampaigns, totalTestimonials, remainingSpace, sortTestimonial })
    } catch (error) {
        res.send(error)
    }
    
    
}