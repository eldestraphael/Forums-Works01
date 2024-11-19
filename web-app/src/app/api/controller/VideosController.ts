import axios from "axios";
import { AwsS3 } from "../infrastructure/clients/AWSS3Client";
import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";

export class VideosController {
  async createVideos(file: any, body: any) {
    try {
      let resp = await new AwsS3().Upload(file, body.asset_type);
      const data = {
        input: resp,
        playback_policy: ["public"],
        encoding_tier: "baseline",
      };

      let muxResponse: any = await axios.post(
        "https://api.mux.com/video/v1/assets",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          auth: {
            username: process.env.MUX_ACCESS_TOKEN!,
            password: process.env.MUX_SECRET_TOKEN!,
          },
        }
      );

      let generateUrl = `https://stream.mux.com/${muxResponse.data.data.playback_ids[0].id}.m3u8`;

      const videos = await prisma.videos.create({
        data: {
          name: file.name as string,
          url: generateUrl,
          asset_content_size: body.asset_content_size
        },
      });

      return videos;
    } catch (err: any) {
      throw err;
    }
  }

  async getVideosList() {
    try {
      const videos = await prisma.videos.findMany({
        select: {
          uuid: true,
          name: true,
          url: true,
          asset_content_size: true
        },
      });

      return {
        message: StaticMessage.VideosFetchedSuccessfully,
        data: videos,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getVideosById(videoUuid: string) {
    try {
      const isVideoExist = await prisma.videos.findUnique({
        where: {
          uuid: videoUuid,
        },
      });

      if (!isVideoExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.VideoNotFound,
          data: null,
        };
      }

      return isVideoExist;
    } catch (err: any) {
      throw err;
    }
  }
}
