import dotenv from "dotenv";
import { Mux } from "@mux/mux-node";
import type { Request, Response } from "express";

dotenv.config();

export const createVideoUpload = async (req: Request, res: Response) => {
  try {
    const mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    });

    // Access uploads through mux.video.uploads
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policies: ["public"],
      },
      cors_origin: "*", // Optional: Configure CORS if needed
    });

    return res.status(200).json(upload);
  } catch (error) {
    console.error("Mux upload creation error:", error);
    return res.status(500).json({ error: "Failed to create Mux upload" });
  }
};