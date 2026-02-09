import {type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createTestimonial = async (req: Request, res: Response) => {
  const {
    campaignId,
    name,
    email,
    position,
    testimonialType,
    content,
    rating,
    playbackId,
  } = req.body;

  let ratingValue = rating ? Number(rating) : 5;

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (testimonialType === "TEXT") {
      const testimonialCount = await prisma.testimonial.count({
        where: {
          campaignId,
          testimonialType: "TEXT",
        },
      });

      if (campaign?.user.plan == "FREE" && testimonialCount >= 5) {
        return res.status(403).json({
          message: "Free plan only allows 5 text testimonials per campaign",
        });
      }
    } else if (testimonialType === "VIDEO") {
      const testimonialCount = await prisma.campaign.findUnique({
        where: {
          id: campaignId,
        },
        select: {
          user: {
            select: {
              videoCount: true,
            },
          },
        },
      });

      if (
        campaign?.user.plan == "FREE" &&
        (testimonialCount?.user.videoCount ?? 0) >= 2
      ) {
        return res.status(403).json({
          message: "Free plan only allows 2 video testimonials per campaign",
        });
      }
    }

    const newTestimonial = await prisma.testimonial.create({
      data: {
        campaignId,
        name,
        email,
        position,
        testimonialType,
        content,
        rating: ratingValue,
        playbackId,
      },
    });

    await prisma.user.update({
      where: {
        id: campaign?.userId as string,
      },
      data: {
        ...(testimonialType === "VIDEO"
          ? { videoCount: { increment: 1 } }
          : {}),
      },
    });
    res.status(201).json({ newTestimonial });
  } catch (error) {
    console.log("Error creating testimonial:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTestimonialsByCampaign = async (
  req: Request,
  res: Response
) => {
  const { campaignId } = req.params;

  try {
    const data = await prisma.campaign.findFirst({
      where: {
        id: campaignId as string,
      },
      include: {
        testimonials: {
          where: {
            archived: false,
          },
        },
      },
    });

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  const { testimonialId, campaignId } = req.body;

  try {
    const deleteTestimonial = await prisma.testimonial.delete({
      where: {
        id: testimonialId as string,
        campaignId: campaignId as string,
      },
    });
    res.status(200).json({ deleteTestimonial });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const archiveTestimonial = async (req: Request, res: Response) => {
  const { testimonialId, campaignId } = req.body;

  try {
    const archiveTestimonial = await prisma.testimonial.update({
      where: {
        id: testimonialId as string,
        campaignId: campaignId as string,
      },
      data: { archived: true },
    });
    res.status(200).json({ archiveTestimonial });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unarchiveTestimonial = async (req: Request, res: Response) => {
  const { testimonialId, campaignId } = req.body;
  try {
    const unarchiveTestimonial = await prisma.testimonial.update({
      where: {
        id: testimonialId as string,
        campaignId: campaignId as string,
      },
      data: { archived: false },
    });
    res.status(200).json({ unarchiveTestimonial });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getArchivedTestimonials = async (req: Request, res: Response) => {
  //@ts-ignore
  const userId = req.userId;

  try {
    const archivedTestimonials = await prisma.campaign.findMany({
      where: {
        userId: userId as string,
      },
      include: {
        testimonials: {
          where: {
            archived: true,
          },
        },
      },
    });

    res.send(archivedTestimonials);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const favouriteTestimonial = async (req: Request, res: Response) => {
  const { testimonialId, campaignId } = req.body;

  try {
    const likeTestimonial = await prisma.testimonial.update({
      where: {
        id: testimonialId as string,
        campaignId: campaignId as string,
      },
      data: {
        favourite: true,
      },
    });
    res.send(likeTestimonial);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unfavouriteTestimonial = async (req: Request, res: Response) => {
  const { testimonialId, campaignId } = req.body;
  try {
    const unlikeTestimonial = await prisma.testimonial.update({
      where: {
        id: testimonialId as string,
        campaignId: campaignId as string,
      },
      data: {
        favourite: false,
      },
    });
    res.send(unlikeTestimonial);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFavouriteTestimonials = async (req: Request, res: Response) => {
  //@ts-ignore
  const userId = req.userId;

  try {
    const favouriteTestimonials = await prisma.campaign.findMany({
      where: {
        userId: userId as string,
      },
      include: {
        testimonials: {
          where: {
            favourite: true,
          },
        },
      },
    });

    res.send(favouriteTestimonials);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const embedTestimonial = async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        campaignId: campaignId as string,
        archived: false,
      },
      orderBy: [
        { favourite: "desc" },
        { createdAt: "desc" },
      ],
    });

    res.status(200).json(testimonials);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUserTestimonials = async (req: Request, res: Response) => {
  //@ts-ignore
  const userId = req.userId;

  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        campaign: {
          userId: userId as string,
        },
        archived: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        testimonialType: true,
        playbackId: true,
        rating: true,
        content: true,
        favourite: true,
        archived: true,
        createdAt: true,
        campaignId: true,
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const importTestimonial = async (req: Request, res: Response) => {
  
  try {
    const { campaignId, url, platform, name, email, position } = req.body;

    if (!campaignId || !url || !platform)
      return res.status(400).json({ message: "Missing fields" });

    if (!["TWITTER", "INSTAGRAM"].includes(platform))
      return res.status(400).json({ message: "Invalid platform" });

    // Optional basic URL validation
    if (
      platform === "TWITTER" &&
      !url.includes("twitter.com") &&
      !url.includes("x.com")
    )
      return res.status(400).json({ message: "Invalid Twitter/X URL" });

    if (platform === "INSTAGRAM" && !url.includes("instagram.com"))
      return res.status(400).json({ message: "Invalid Instagram URL" });

    const testimonial = await prisma.testimonial.create({
      data: {
        campaignId,
        testimonialType: platform,
        content: url,
        name: name || "Imported User",
        email: email || "imported@example.com",
        position: position || null,
      },
    });

    return res.status(201).json({
      message: "Imported successfully",
      testimonial,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
