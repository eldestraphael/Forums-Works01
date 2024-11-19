import { UploadCsvValidator } from "../validators/UploadCsvValidator";

let csvToJson = require("convert-csv-to-json");

export class JsonCsvConvertor {
  async csvToJson(path: string) {
    try {
      const json = csvToJson.fieldDelimiter(",").getJsonFromCsv(path);
      await new UploadCsvValidator().validateCSVRecords(json);
      return json;
    } catch (err: any) {
      throw err;
    }
  }
}
