import { csvParse } from "d3-dsv";

export async function fetchGoogleForm(id: string) {
  let rawCSV = await fetch(
    `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`
  ).then((d) => d.text());
  return csvParse(rawCSV);
}
