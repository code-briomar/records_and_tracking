import { Case, getAllCases } from "../services/cases";

export let caseFiles: Case[] = [];

export const fetchCasesData = async () => {
  try {
    // Fetch all staff data
    const cases = await getAllCases();

    caseFiles = cases;
  } catch (error) {
    console.error("Error fetching staff data:", error);
  }
};
fetchCasesData();
