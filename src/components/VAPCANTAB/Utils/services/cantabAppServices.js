import * as aq from "arquero";
import * as XLSX from "xlsx";

export const fetchScenarioRunData = async (id) => {
  const response = await fetch(`/server/api/vis/scenarioruncantab/${id}/`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const fetchDefaultHierarchy = async () => {
  const response = await fetch("./vis/hierarchies/default_hierarchy_v1.1.json");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const fetchTestHierarchy = async () => {
  const url = "./vis/hierarchies/largeTestDatahierarchy.json";
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const fetchTestData = async () => {
  const response = await fetch("./vis/csv/largeTestData.csv");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const csvText = await response.text();

  // Parsear el CSV y convertir los nombres de las columnas a minúsculas
  const data = Array.from({ length: 1 }, () =>
    aq.fromCSV(csvText).objects()
  ).flat();

  return data;
};

export const fetchAvailablePopulations = async (token) => {
  const headers = token ? { Authorization: `Token ${token}` } : {};
  const response = await fetch("/server/api/vis/availablecantabpopulations/", {
    headers: { "Content-Type": "application/json", ...headers },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const createDictionaryFromXLS = async (filePath) => {
  const response = await fetch(filePath);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(sheet).reduce((dict, row) => {
    if (row["measure_name"] && row["measure_description"]) {
      dict[row["measure_name"]] = row["measure_description"];
    }
    return dict;
  }, {});
};
