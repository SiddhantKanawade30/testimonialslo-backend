import express, { Router } from "express";
import { middleware } from "../middleware/middleware.js";
import { createCampaign, deleteCampaign, getCampaigns, editCampaign } from "../controllers/campaign.js";
const CampaignRouter = Router();
CampaignRouter.post("/create", middleware, createCampaign);
CampaignRouter.delete("/delete", middleware, deleteCampaign);
CampaignRouter.get("/get", middleware, getCampaigns);
CampaignRouter.put("/edit", middleware, editCampaign);
export default CampaignRouter;
//# sourceMappingURL=campaign.js.map