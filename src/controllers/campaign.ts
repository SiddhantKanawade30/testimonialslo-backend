import express, { type Request, type Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { middleware } from "../middleware/middleware.js";
const prisma = new PrismaClient();

export const getCampaignById = async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId as any },
    });

    if (campaign) {
      res.status(200).json(campaign);
    } else {
      return res.status(404).json({ message: "Campaign not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get campaign" });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  const { title, description, websiteUrl, category } = req.body;
  const FRONTEND_URL = process.env.FRONTEND_URL;
  //@ts-ignore
  const userId = req.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const campaignCount = await prisma.campaign.count({
      where: { userId },
    });

    if (user?.plan == "FREE" && campaignCount >= 2) {
      return res.status(403).json({
        message: "Free plan allows only 2 campaigns",
      });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const newCampaign = await tx.campaign.create({
        data: {
          title,
          description,
          websiteUrl,
          category,
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

    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
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
    res.status(200).json({ deletedCampaign });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete campaign" });
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
    res.status(200).json(campaigns);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get campaigns" });
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
    res.status(200).json({ editedCampaign });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to edit campaign" });
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
    res.status(200).json({editTemplate})
  }catch(error){
    console.log(error)
    res.status(500).json({message: "Failed to edit template"})
  }
}