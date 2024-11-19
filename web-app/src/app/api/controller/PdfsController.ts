import { StaticMessage } from "../constants/StaticMessages";
import { AwsS3 } from "../infrastructure/clients/AWSS3Client";
import prisma from "@/lib/prisma";

export class PdfsController {
  async createPdfs(file: any, body: any) {
    try {
      let resp = await new AwsS3().Upload(file, body.asset_type);
      const pdfs = await prisma.pdfs.create({
        data: {
          name: file.name as string,
          url: resp,
          asset_content_size: body.asset_content_size
        },
      });
      return pdfs;
    } catch (err: any) {
      throw err;
    }
  }

  async getPdfsList() {
    try {
      const pdfs = await prisma.pdfs.findMany({
        select: {
          uuid: true,
          name: true,
          url: true,
          asset_content_size: true
        },
      });

      if (!pdfs) {
        throw {
          statusCode: 404,
          message: StaticMessage.PdfsNotFound,
          data: null,
        };
      }
      return {
        message: StaticMessage.PdfsFetchedSuccessfully,
        data: pdfs,
      };
    } catch (err: any) {
      throw err;
    }
  }

  async getPdfsById(pdfUuid: string) {
    try {
      const isPdfsExist = await prisma.pdfs.findUnique({
        where: {
          uuid: pdfUuid,
        },
      });

      if (!isPdfsExist) {
        throw {
          statusCode: 404,
          message: StaticMessage.PdfNotFound,
          data: null,
        };
      }

      return isPdfsExist;
    } catch (err: any) {
      throw err;
    }
  }
}
