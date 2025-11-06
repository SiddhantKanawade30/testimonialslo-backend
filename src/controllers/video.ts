import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export const createVideoUpload = async () => {

    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;
   
  try {
    // call Mux API with axios
    const response = await axios.post(
      "https://api.mux.com/video/v1/uploads",
      {
        cors_origin: "http://localhost:3000", // your frontend origin
        new_asset_settings: {
          playback_policies: ["public"],
          video_quality: "basic",
        },
      },
      {
        auth: {
          username : tokenId!,
          password : tokenSecret!,
        },
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data.data.url;
  } catch (error) {
    console.error("Error creating upload:", error);
  }
}
