import { StaticMessage } from "../../constants/StaticMessages";
import { getS3UploadPath } from "../../helpers/UploadPathGenerator";
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

type AssetType = "pdf" | "video" | "audio" | "image";

interface AssetConfig {
  allowedExtensions: string[];
  maxSize: number;
  errorMessage: string;
}

const ONE_MEGABYTE = 1048576; // 1MB in bytes
const ONE_GIGABYTE = 1073741824; // 1GB in bytes
const TWO_GIGABYTES = 2147483648; // 2GB in bytes

const assetConfig: Record<AssetType, AssetConfig> = {
  pdf: {
    allowedExtensions: [".pdf"],
    maxSize: ONE_GIGABYTE,
    errorMessage: "Please upload a file in .pdf format.",
  },
  video: {
    allowedExtensions: [
      ".mp4",
      ".mov",
      ".avi",
      ".mkv",
      ".wmv",
      ".flv",
      ".webm",
      ".mpeg",
      ".mpg",
      ".3gp",
      ".ogv",
      ".m4v",
      ".asf",
      ".vob",
      ".swf",
      ".f4v",
    ],
    maxSize: TWO_GIGABYTES,
    errorMessage:
      "Please upload a file in one of the following formats: .mp4, .mov, .avi, .mkv, .wmv, .flv, .webm, .mpeg, .mpg, .3gp, .ogv, .m4v, .asf, .vob, .swf, .f4v",
  },
  audio: {
    allowedExtensions: [".mp3", ".aac", ".ogg", ".wav", ".m4a"],
    maxSize: TWO_GIGABYTES,
    errorMessage:
      "Please upload a file in one of the formats: .mp3, .aac, .ogg, .wav, .m4a",
  },
  image: {
    allowedExtensions: [".png", ".jpg", ".jpeg", ".svg"],
    maxSize: ONE_MEGABYTE,
    errorMessage:
      "Please upload a file in one of the following formats: .png, .jpg, .jpeg, or .svg.",
  },
};

export class AwsS3 {
  async Upload(file: any, assetType: AssetType) {
    let arrayBuffer;
    try {
      const config = assetConfig[assetType];

      if (!config) {
        throw {
          statusCode: 404,
          message: StaticMessage.UnsupportedAssetType,
        };
      }

      const isValidExtension = config.allowedExtensions.some((extension) =>
        file.name.endsWith(extension)
      );

      if (!isValidExtension) {
        throw {
          statusCode: 422,
          message: config.errorMessage,
        };
      }

      if (file.size > config.maxSize) {
        throw new Error(
          `${
            assetType.charAt(0).toUpperCase() + assetType.slice(1)
          } exceeds the limit of ${config.maxSize / ONE_GIGABYTE}GB`
        );
      }

      const s3client = new S3Client({});
      const path = process.env.USER_FILE_STORAGE;
      arrayBuffer = await file.arrayBuffer();
      const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${path}${assetType}/${file.name}`,
        ACL: "public-read",
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      };

      await s3client.send(new PutObjectCommand(param));

      arrayBuffer = new ArrayBuffer(0);

      return getS3UploadPath(assetType, file.name);
    } catch (error) {
      throw error;
    }
  }
}
