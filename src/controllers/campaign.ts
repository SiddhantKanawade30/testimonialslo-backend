import { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for campaign creation validation
const createCampaignSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required").max(50, "Category must be less than 50 characters").optional(),
});

export const getCampaignById = async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId as any },
    });

    if (campaign) {
      res.status(200).json({
        success: true,
        campaign
      });
    } else {
      return res.status(404).json({ 
        success: false,
        message: "Campaign not found" 
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get campaign" 
    });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  const FRONTEND_URL = process.env.FRONTEND_URL;
  //@ts-ignore
  const userId = req.userId;

  try {
    // Validate input using Zod schema
    const validationResult = createCampaignSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));
      
      return res.status(400).json({ 
        success: false,
        message: "Validation failed", 
        errors: errors
      });
    }

    const { title, description, websiteUrl, category } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const campaignCount = await prisma.campaign.count({
      where: { userId },
    });

    if (user?.plan == "FREE" && campaignCount >= 2) {
      return res.status(403).json({
        success: false,
        message: "Free plan allows only 2 campaigns",
      });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const newCampaign = await tx.campaign.create({
        data: {
          title,
          description,
          websiteUrl: websiteUrl || null,
          category: category || null,
          userId,
        },
      });

      const shareLink = `${FRONTEND_URL}/${newCampaign.id}`;

      const updatedCampaign = await tx.campaign.update({
        where: { id: newCampaign.id },
        data: {
          shareLink,
        },
      });

      return updatedCampaign;
    });

    res.status(201).json({ 
      success: true,
      message: "Campaign created successfully",
      result 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  const { campaignId } = req.body;
  //@ts-ignore
  const userId = req.userId;
  try {
    const deletedCampaign = await prisma.campaign.delete({
      where: { id: campaignId as string, userId: userId as string },
    });
    res.status(200).json({ 
      success: true,
      deletedCampaign 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete campaign" 
    });
  }
};

export const getCampaigns = async (req: Request, res: Response) => {
  //@ts-ignore
  const userId = req.userId;
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: userId as string,
      },
      include: {
        _count: {
          select: {
            testimonials: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      campaigns
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get campaigns" 
    });
  }
};

export const editCampaign = async (req: Request, res: Response) => {
  const { campaignId, title, description } = req.body;
  //@ts-ignore
  const userId = req.userId;
  try {
    const editedCampaign = await prisma.campaign.update({
      where: { id: campaignId as string, userId: userId as string },
      data: { title, description },
    });
    res.status(200).json({ 
      success: true,
      editedCampaign 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false,
      message: "Failed to edit campaign" 
    });
  }
};

export const editTemplate = async(req: Request, res: Response) => {
  const {campaignId, templateType} = req.body;
  //@ts-ignore
  const userId = req.userId;

  try{
    const editTemplate = await prisma.campaign.update({
      where: {id: campaignId as string, userId: userId as string},
      data: {templateType}
    })
    res.status(200).json({
      success: true,
      editTemplate
    });
  }catch(error){
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Failed to edit template"
    })
  }
}