import { type Request, type Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const createTestimonial = async (req: Request, res: Response) => {
    const { campaignId, name, email, message, rating } = req.body;

    // Ensure rating is a number, default to 5 if not provided
    let ratingValue = rating ? Number(rating) : 5;
    
   
    

    try {
        const newTestimonial = await prisma.testimonial.create({
            data: { 
                campaignId, 
                name, 
                email, 
                message, 
                rating: ratingValue 
            }
        })
        res.status(201).json({ newTestimonial })
    } catch (error) {
        console.log("Error creating testimonial:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getTestimonialsByCampaign = async (req: Request, res: Response) => {
    const { campaignId } = req.params

    try {
        const data = await prisma.campaign.findFirst({
            where: {
                id: campaignId as string
            },
            include: {
                testimonials: true
            }
        })

        res.send(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteTestimonial = async (req: Request, res: Response) => {
    const { testimonialId, campaignId } = req.body

    try {
        const deleteTestimonial = await prisma.testimonial.delete({
            where: {
                id: testimonialId as string,
                campaignId: campaignId as string
            }
        })
        res.status(200).json({ deleteTestimonial })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const archiveTestimonial = async (req: Request, res: Response) => {
    const { testimonialId, campaignId } = req.body

    try {
        const archiveTestimonial = await prisma.testimonial.update({
            where: {
                id: testimonialId as string,
                campaignId: campaignId as string
            },
            data: { archived: true }
        })
        res.status(200).json({ archiveTestimonial })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const unarchiveTestimonial = async (req: Request, res: Response) => {
    const { testimonialId, campaignId } = req.body
    try {
        const unarchiveTestimonial = await prisma.testimonial.update({
            where: {
                id: testimonialId as string,
                campaignId: campaignId as string
            },
            data: { archived: false }
        })
        res.status(200).json({ unarchiveTestimonial })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getArchivedTestimonials = async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.userId;

    try {
        const archivedTestimonials = await prisma.campaign.findMany({
            where: {
                userId: userId as string
            },
            include: {
                testimonials: {
                    where: {
                        archived: true
                    }
                }
            }
        })

        res.send(archivedTestimonials);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const favouriteTestimonial = async (req: Request, res: Response) => {
    const { testimonialId, campaignId } = req.body;

    try {
        const likeTestimonial = await prisma.testimonial.update({
            where: {
                id: testimonialId as string,
                campaignId: campaignId as string
            },
            data: {
                favourite: true
            }
        })
        res.send(likeTestimonial);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const unfavouriteTestimonial = async (req: Request, res: Response) => {
    const { testimonialId, campaignId } = req.body;
    try {
        const unlikeTestimonial = await prisma.testimonial.update({
            where: {
                id: testimonialId as string,
                campaignId: campaignId as string
            },
            data: {
                favourite: false
            }
        })
        res.send(unlikeTestimonial);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getFavouriteTestimonials = async (req: Request, res: Response) => {
    //@ts-ignore
     const userId = req.userId;

    try {
        const favouriteTestimonials = await prisma.campaign.findMany({
            where: {
                userId: userId as string
            },
            include: {
                testimonials: {
                    where: {
                        favourite: true
                    }
                }
            }
        })

        res.send(favouriteTestimonials);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const embedTestimonial = async (req: Request, res: Response) => {
    const { campaignId } = req.params

    try {
        const testimonials = await prisma.testimonial.findMany({
            where: {
                campaignId: campaignId as string
            }
        })


        const html = `
         <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; background: #fafafa; }
            .testimonial {
              background: white;
              padding: 15px;
              border-radius: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              margin-bottom: 10px;
            }
            .name { font-weight: bold; margin-bottom: 5px; }
            .message { color: #555; }
          </style>
        </head>
        <body>
          <h2>What People Say</h2>
          ${testimonials.map((t: any) => `
                <div class="testimonial">
                  <div class="name">${t.name}</div>
                  <div class="message">${t.message}</div>
                </div>`
              )}
        </body>
      </html>
        `

        res.send(html);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getAllUserTestimonials = async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.userId;

    try {
        const testimonials = await prisma.testimonial.findMany({
            where: {
                campaign: {
                    userId: userId as string
                },
                archived: false
            },
            select: {
                id: true,
                name: true,
                email: true,
                message: true,
                favourite: true,
                archived: true,
                createdAt: true,
                campaignId: true,
                campaign: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            count: testimonials.length,
            data: testimonials
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};