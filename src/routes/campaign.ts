import express, { Router } from "express"
import { middleware } from "../middleware/middleware.js"
import { createCampaign, deleteCampaign, getCampaigns, editCampaign, getCampaignById } from "../controllers/campaign.js"
import { publicLimiter } from "../middleware/ratelimiter.js"
import { editTemplate } from "../controllers/campaign.js"

const CampaignRouter = Router();

CampaignRouter.post("/create", middleware, createCampaign)
CampaignRouter.delete("/delete", middleware, deleteCampaign)    
CampaignRouter.get("/get", middleware, getCampaigns)
CampaignRouter.get("/get/:campaignId", publicLimiter, getCampaignById)
CampaignRouter.put("/edit", middleware, editCampaign)   
CampaignRouter.post("/edit-template", middleware, editTemplate)   


export default CampaignRouter;