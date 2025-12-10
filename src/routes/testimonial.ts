import { Router } from "express";
import { middleware } from "../middleware/middleware.js";
import { createTestimonial, getTestimonialsByCampaign, getAllUserTestimonials } from "../controllers/testimonial.js";
import { archiveTestimonial, deleteTestimonial } from "../controllers/testimonial.js";
import { unarchiveTestimonial } from "../controllers/testimonial.js";
import { favouriteTestimonial } from "../controllers/testimonial.js";
import { getFavouriteTestimonials, embedTestimonial, getArchivedTestimonials, unfavouriteTestimonial } from "../controllers/testimonial.js";
import { createVideoUpload } from "../controllers/video.js";

const testimonialRouter = Router();

testimonialRouter.post("/create", createTestimonial)
testimonialRouter.get("/create-video-upload", createVideoUpload)
testimonialRouter.get("/get/all", middleware, getAllUserTestimonials)
testimonialRouter.get("/get/:campaignId", middleware, getTestimonialsByCampaign);

testimonialRouter.delete("/delete", middleware, deleteTestimonial)
testimonialRouter.put("/archive", middleware, archiveTestimonial)
testimonialRouter.put("/unarchive", middleware, unarchiveTestimonial)
testimonialRouter.put("/favourite", middleware, favouriteTestimonial)
testimonialRouter.put("/remove-favorite", middleware, unfavouriteTestimonial)
testimonialRouter.get("/archived", middleware, getArchivedTestimonials)
testimonialRouter.get("/favourite", middleware, getFavouriteTestimonials)
testimonialRouter.get("/embed/:campaignId", embedTestimonial);


export default testimonialRouter;