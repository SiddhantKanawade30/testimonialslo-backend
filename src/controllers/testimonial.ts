import { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createTestimonial = async (req: Request, res: Response) => {
  const {
    campaignId,
    name,
    email,
    position,
    testimonialType,
    message,
    rating,
    playbackId,
  } = req.body;

  // Ensure rating is a number, default to 5 if not provided
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

    if(testimonialType === "text"){
      const testimonialCount = await prisma.testimonial.count({
      where: {
         campaignId,
        testimonialType: "text"
       },
    });

    if (campaign?.user.plan == "FREE" && testimonialCount >= 5) {
      return res.status(403).json({
        message: "Free plan only allows 5 text testimonials per campaign",
      });
    }

    }else if(testimonialType === "video"){
      const testimonialCount = await prisma.campaign.findUnique({
        where:{
          id: campaignId
        },
        select:{
          user:{
            select:{
              videoCount:true
            }
          }
        }
      })

      if (campaign?.user.plan == "FREE" && (testimonialCount?.user.videoCount ?? 0) >= 2) {
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
        message,
        rating: ratingValue,
        playbackId,
      },
    });

    await prisma.user.update({
      where:{
        id: campaign?.userId as string
      },
      data:{
        ...(testimonialType === "video" ? { videoCount: { increment: 1 } } : {})
      }
    })
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
          where:{
            archived: false
          }
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
        archived: false, // Only show non-archived testimonials
      },
      orderBy: [
        { favourite: "desc" }, // Favorites first
        { createdAt: "desc" }, // Then by newest
      ],
    });

    // Generate testimonial cards HTML
    const testimonialCards = testimonials
      .map((t: any) => {
        const stars =
          "★".repeat(t.rating || 0) + "☆".repeat(5 - (t.rating || 0));

        if (t.testimonialType === "video" && t.playbackId) {
          return `
                    <div class="testimonial testimonial-video">
                        <div class="video-container">
                            <iframe
                                src="https://player.mux.com/${t.playbackId}"
                                style="width: 100%; border: none; aspect-ratio: 16/9; border-radius: 8px;"
                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                allowfullscreen
                            ></iframe>
                        </div>
                        <div class="testimonial-details">
                            <div class="rating">${stars}</div>
                            <div class="name">${t.name || ""}</div>
                            ${
                              t.position
                                ? `<div class="position">${t.position}</div>`
                                : ""
                            }
                        </div>
                    </div>
                `;
        } else {
          return `
                    <div class="testimonial testimonial-text">
                        <div class="rating">${stars}</div>
                        ${
                          t.message
                            ? `<div class="message">"${t.message}"</div>`
                            : ""
                        }
                        <div class="testimonial-details">
                            <div class="name">${t.name || ""}</div>
                            ${
                              t.position
                                ? `<div class="position">${t.position}</div>`
                                : ""
                            }
                        </div>
                    </div>
                `;
        }
      })
      .join("");

    const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Testimonials</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        padding: 20px;
                        background: #fafafa;
                        line-height: 1.6;
                    }
                    
                    h2 {
                        color: #1a1a1a;
                        margin-bottom: 24px;
                        font-size: 28px;
                        font-weight: 700;
                        text-align: center;
                    }
                    
                    .testimonials-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                        gap: 20px;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    
                    .testimonial {
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
                        transition: transform 0.2s, box-shadow 0.2s;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .testimonial:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
                    }
                    
                    .testimonial-video {
                        min-height: 300px;
                    }
                    
                    .video-container {
                        width: 100%;
                        border-radius: 8px;
                        overflow: hidden;
                        background: #f0f0f0;
                    }
                    
                    .rating {
                        color: #fbbf24;
                        font-size: 18px;
                        letter-spacing: 2px;
                        margin-bottom: 8px;
                    }
                    
                    .message {
                        color: #374151;
                        font-size: 15px;
                        line-height: 1.7;
                        font-style: italic;
                        margin-bottom: 12px;
                        flex-grow: 1;
                    }
                    
                    .testimonial-details {
                        border-top: 1px solid #e5e7eb;
                        padding-top: 12px;
                    }
                    
                    .name {
                        font-weight: 700;
                        color: #1f2937;
                        font-size: 16px;
                        margin-bottom: 4px;
                    }
                    
                    .position {
                        color: #6b7280;
                        font-size: 14px;
                        margin-bottom: 4px;
                    }
                    
                    .email {
                        color: #9ca3af;
                        font-size: 13px;
                        word-break: break-all;
                    }

                    .no-testimonials {
                        text-align: center;
                        padding: 40px 20px;
                        color: #6b7280;
                        font-size: 16px;
                    }
                    
                    @media (max-width: 768px) {
                        body {
                            padding: 12px;
                        }
                        
                        h2 {
                            font-size: 24px;
                            margin-bottom: 20px;
                        }
                        
                        .testimonials-grid {
                            grid-template-columns: 1fr;
                            gap: 16px;
                        }
                        
                        .testimonial {
                            padding: 16px;
                        }
                    }
                </style>
            </head>
            <body>
                <h2>What People Say</h2>
                ${
                  testimonials.length > 0
                    ? `<div class="testimonials-grid">${testimonialCards}</div>`
                    : '<div class="no-testimonials">No testimonials yet.</div>'
                }
            </body>
            </html>
        `;

    // Set proper content type and send HTML
    res.setHeader("Content-Type", "text/html");
    res.send(html);
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
        message: true,
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
