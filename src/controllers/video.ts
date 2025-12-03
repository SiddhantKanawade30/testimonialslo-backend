import dotenv from "dotenv";
import axios from "axios";
import type { Request, Response } from "express";
dotenv.config();


export const createVideoUpload = async (req: Request, res: Response) => {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  try {
    const response = await axios.post(
      "https://api.mux.com/video/v1/uploads",
      {
        cors_origin: process.env.FRONTEND_URL,
        new_asset_settings: { playback_policies: ["public"], video_quality: "basic" },
      },
      {
        auth: { username: tokenId!, password: tokenSecret! },
        headers: { "Content-Type": "application/json" },
      }
    );

    return res.json(response.data.data);
  } catch (error) {
    console.error(error);
    return res.json({ error: "Failed to create Mux upload" });
  }
};