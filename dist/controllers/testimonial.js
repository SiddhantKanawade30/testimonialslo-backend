import {} from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const createTestimonial = async (req, res) => {
    const { campaignId, name, email, message } = req.body;
    try {
        const newTestimonial = await prisma.testimonial.create({
            data: { campaignId, name, email, message }
        });
        res.status(201).json({ newTestimonial });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getAllTestimonials = async (req, res) => {
    const { campaignId } = req.body;
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: {
                campaignId: campaignId
            }
        });
        res.send(testimonials);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const deleteTestimonial = async (req, res) => {
    const { testimonialId, campaignId } = req.body;
    try {
        const deleteTestimonial = await prisma.testimonial.delete({
            where: {
                id: testimonialId,
                campaignId: campaignId
            }
        });
        res.status(200).json({ deleteTestimonial });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const archiveTestimonial = async (req, res) => {
    const { testimonialId, campaignId } = req.body;
    try {
        const archiveTestimonial = await prisma.testimonial.update({
            where: {
                id: testimonialId,
                campaignId: campaignId
            },
            data: { archived: true }
        });
        res.status(200).json({ archiveTestimonial });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const unarchiveTestimonial = async (req, res) => {
    const { testimonialId, campaignId } = req.body;
    try {
        const unarchiveTestimonial = await prisma.testimonial.update({
            where: {
                id: testimonialId,
                campaignId: campaignId
            },
            data: { archived: false }
        });
        res.status(200).json({ unarchiveTestimonial });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getArchivedTestimonials = async (req, res) => {
    const { campaignId } = req.body;
    try {
        const archivedTestimonials = await prisma.testimonial.findMany({
            where: {
                archived: true,
                campaignId: campaignId
            }
        });
        res.send(archivedTestimonials);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const favouriteTestimonial = async (req, res) => {
    const { testimonialId, campaignId } = req.body;
    try {
        const likeTestimonial = await prisma.testimonial.update({
            where: {
                id: testimonialId,
                campaignId: campaignId
            },
            data: {
                favourite: true
            }
        });
        res.send(likeTestimonial);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const unfavouriteTestimonial = async (req, res) => {
    const { testimonialId, campaignId } = req.body;
    try {
        const unlikeTestimonial = await prisma.testimonial.update({
            where: {
                id: testimonialId,
                campaignId: campaignId
            },
            data: {
                favourite: false
            }
        });
        res.send(unlikeTestimonial);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getFavouriteTestimonials = async (req, res) => {
    const { campaignId } = req.body;
    try {
        const favouriteTestimonials = await prisma.testimonial.findMany({
            where: {
                favourite: true,
                campaignId: campaignId
            }
        });
        res.send(favouriteTestimonials);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getTestimonialsByCampaign = async (req, res) => {
    const { campaignId } = req.body;
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: {
                campaignId: campaignId
            }
        });
        res.send(testimonials);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const embedTestimonial = async (req, res) => {
    const { campaignId } = req.body;
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: {
                campaignId: campaignId
            }
        });
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
          ${testimonials.map((t) => `
                <div class="testimonial">
                  <div class="name">${t.name}</div>
                  <div class="message">${t.message}</div>
                </div>`)}
        </body>
      </html>
        `;
        res.send(html);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=testimonial.js.map