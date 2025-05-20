import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import store from '@/components/VAPUtils/features/store';

// File processor for CSV/TSV/TXT files
const CsvProcessor = {
  process(fileContent, onFileParsed) {
    Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        console.log('Parsed CSV/TSV Data:', result.data);
        onFileParsed(result.data);
      }
    });
  }
};

// File processor for XLS/XLSX files
const ExcelProcessor = {
  process(fileContent, onFileParsed) {
    const workbook = XLSX.read(fileContent, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    console.log('Parsed XLS/XLSX Data:', jsonData);
    onFileParsed(jsonData);
  }
};

// File processor for JSON files
const JsonProcessor = {
  process(fileContent, onFileParsed) {
    try {
      const jsonData = JSON.parse(fileContent);
      console.log('Parsed JSON Data:', jsonData);
      onFileParsed(jsonData);
    } catch (error) {
      console.error('Error parsing JSON file:', error);
      onFileParsed([]);
    }
  }
};

// Factory that returns the appropriate processor based on file extension
export const FileProcessorFactory = {
  getProcessor(fileType) {
    switch (fileType) {
      case 'csv':
      case 'tsv':
      case 'txt':
        return CsvProcessor;
      case 'xls':
      case 'xlsx':
        return ExcelProcessor;
      case 'json':
        return JsonProcessor;
      default:
        store.getState().cantab.notApi.error({
          message: 'Data Format Not Supported',
          description: 'Format: ' + fileType,
          placement: 'topRight',
          duration: 2,
          showProgress: true,
          pauseOnHover: true
        });
    }
  }
};
