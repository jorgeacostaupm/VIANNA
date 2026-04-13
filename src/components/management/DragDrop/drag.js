import Papa from "papaparse";

// File processor for CSV/TSV/TXT files
const CsvProcessor = {
  process(fileContent, onFileParsed, onError = () => {}) {
    Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          const firstError = result.errors[0];
          onError(new Error(firstError?.message || "CSV parsing failed"));
          return;
        }
        onFileParsed(result.data);
      },
      error: (error) => {
        onError(error);
      },
    });
  },
};

// File processor for JSON files
const JsonProcessor = {
  process(fileContent, onFileParsed, onError = () => {}) {
    try {
      const jsonData = JSON.parse(fileContent);
      onFileParsed(jsonData);
    } catch {
      onError(new Error("Invalid JSON file format"));
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
        throw new Error("Data format not supported");
    }
  },
};
