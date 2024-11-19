export function getS3UploadPath(assetType: string, fileName: string) {
  const filePrefix = process.env.AWS_S3_UPLOAD_FILE_PATH;
  return filePrefix + assetType + "/" + fileName;
}
