import Papa from "papaparse";

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
      case "json":
        return JsonProcessor;
      default:
        console.error("Data Format Not Supported");
    }
  },
};
