import Papa from "papaparse";
import * as XLSX from "xlsx";
import store from "@/features/store";

// File processor for CSV/TSV/TXT files
const CsvProcessor = {
  process(fileContent, onFileParsed) {
    Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        onFileParsed(result.data);
      },
    });
  },
};

// File processor for XLS/XLSX files
const ExcelProcessor = {
  process(fileContent, onFileParsed) {
    const workbook = XLSX.read(fileContent, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    onFileParsed(jsonData);
  },
};

// File processor for JSON files
const JsonProcessor = {
  process(fileContent, onFileParsed) {
    try {
      const jsonData = JSON.parse(fileContent);
      onFileParsed(jsonData);
    } catch (error) {
      console.error("Error parsing JSON file:", error);
      onFileParsed([]);
    }
  },
};

// Factory that returns the appropriate processor based on file extension
export const FileProcessorFactory = {
  getProcessor(fileType) {
    switch (fileType) {
      case "csv":
      case "tsv":
      case "txt":
        return CsvProcessor;
      case "xls":
      case "xlsx":
        return ExcelProcessor;
      case "json":
        return JsonProcessor;
      default:
        console.error("Data Format Not Supported");
    }
  },
};
