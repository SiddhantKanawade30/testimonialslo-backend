import dotenv from "dotenv";
import { Mux } from "@mux/mux-node";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { getMonthKey } from "../utils/date.js";

dotenv.config();

export const createVideoUpload = async (req: Request, res: Response) => {
  const { campaignId } = req.body;

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            plan: true,
            videoCount: true,
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.user.plan == "FREE" && campaign.user.videoCount >= 2) {
      return res.status(403).json({ error: "Free plan allows only 2 videos" });
    }

    const month = getMonthKey();
    const usage = await prisma.usage.findUnique({
      where: {
        userId_month: {
          userId: campaign.userId,
          month,
        },
      },
    });

    if(campaign.user.plan == "PREMIUM" && (usage?.videoUsed ?? 0 ) >= 30){
      return res.status(403).json({ error: "Fair usage exceeded per month" });
    }

    const mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    });

    // Access uploads through mux.video.uploads
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policies: ["public"],
      },
      cors_origin: "*", 
    });

    return res.status(200).json({
      id: upload.id,
      url: upload.url,
    });
  } catch (error) {
    console.error("Mux upload creation error:", error);
    return res.status(500).json({ error: "Failed to create Mux upload" });
  }
};

export const VideoAssetFromUpload = async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;

    console.log("VideoAssetFromUpload called with uploadId:", uploadId);

    if (!uploadId) {
      return res.status(400).json({ error: "Upload ID is required" });
    }

    const muxClient = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    });

    // Poll Mux API to get the upload status
    const upload = await muxClient.video.uploads.retrieve(uploadId);
    console.log("Upload status from Mux:", upload.asset_id, upload.status);

    // Check if asset_id exists and is a string
    if (upload.asset_id && typeof upload.asset_id === "string") {
      // Get the asset details
      const asset = await muxClient.video.assets.retrieve(upload.asset_id);

      // Get the playback ID
      const playbackId = asset.playback_ids?.[0]?.id;

      if (!playbackId) {
        return res.status(202).json({
          message: "Asset created but playback ID not yet available",
        });
      }

      return res.json({
        assetId: asset.id,
        playbackId: playbackId,
        status: asset.status,
      });
    } else {
      // Video still processing - asset not yet created
      return res
        .status(202)
        .json({ message: "Processing - asset not yet created" });
    }
  } catch (error) {
    console.error("Error retrieving video asset:", error);
    return res.status(500).json({ error: "Failed to retrieve video asset" });
  }
};
