import { StaticMessage } from "../constants/StaticMessages";
import { AwsS3 } from "../infrastructure/clients/AWSS3Client";
import prisma from "@/lib/prisma";

export class ImagesController {
  async createImages(file: any, body: any) {
    try {
      let resp = await new AwsS3().Upload(file, body.asset_type);
      const images = await prisma.images.create({
        data: {
          name: file.name as string,
          url: resp,
          asset_content_size: 1,
        },
      });
      return images;
    } catch (err: any) {
      throw err;
    }
  }

  async getImagesList() {
    try {
      const images = await prisma.images.findMany({
        select: {
          uuid: true,
          name: true,
          url: true,
          asset_content_size: true,
        },
      });

      if (!images) {
        throw {
          statusCode: 404,
          message: StaticMessage.ImagesNotFound,
          data: null,
        };
      }
      return {
        message: StaticMessage.ImagesFetchedSuccessfully,
        data: images,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getImageById(imageUuid: string) {
    try {
      const isImageExist = await prisma.images.findUnique({
        where: {
          uuid: imageUuid,
        },
      });

      if (!isImageExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.ImageNotFound,
          data: null,
        };
      }

      return isImageExist;
    } catch (err: any) {
      throw err;
    }
  }
}
