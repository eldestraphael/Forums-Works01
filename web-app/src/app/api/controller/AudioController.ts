import axios from "axios";
import { AwsS3 } from "../infrastructure/clients/AWSS3Client";
import prisma from "@/lib/prisma";
import { StaticMessage } from "../constants/StaticMessages";

export class AudiosController {
  async createAudios(file: any, body: any) {
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

      const videos = await prisma.audios.create({
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

  async getAudiosList() {
    try {
      const audios = await prisma.audios.findMany({
        select: {
          uuid: true,
          name: true,
          url: true,
          asset_content_size: true
        },
      });

      if (!audios) {
        throw {
          statusCode: 404,
          message: StaticMessage.AudiosNotFound,
          data: null,
        };
      }
      return {
        message: StaticMessage.AudiosFetchedSuccessfully,
        data: audios,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getAudiosById(audioUuid: string) {
    try {
      const isAudioExist = await prisma.audios.findUnique({
        where: {
          uuid: audioUuid,
        },
      });

      if (!isAudioExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.AudioNotFound,
          data: null,
        };
      }

      return isAudioExist;
    } catch (err: any) {
      throw err;
    }
  }
}
