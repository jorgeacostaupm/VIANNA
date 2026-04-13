import * as aq from "arquero";

export const fetchHierarchy = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const fetchTestData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const csvText = await response.text();

  const data = Array.from({ length: 1 }, () => aq.fromCSV(csvText).objects()).flat();

  return data;
};

export const fetchDescriptionsCSV = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const csvText = await response.text();

  return csvText;
};
