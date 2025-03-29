import { Case, getAllCases } from "../services/cases";

let caseFiles: Case[] = [];

export const fetchCasesData = async () => {
  try {
    // Fetch all staff data
    const cases = await getAllCases();

    caseFiles = cases;
    console.log("Cases:", caseFiles);
  } catch (error) {
    console.error("Error fetching staff data:", error);
  }
};
fetchCasesData();
export default caseFiles;
