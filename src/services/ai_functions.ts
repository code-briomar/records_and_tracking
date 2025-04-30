import axios from "axios";
import { fileSectionData } from "../components/files_data";

export const queryDataWithAI = async (query: string) => {
    console.log("Query: ", query);
    console.log("File Section Data: ", fileSectionData);
    return await axios.post("https://google-gemini-proxy-for-chatflow.onrender.com/interpret-files",{
        query: query,
        data: fileSectionData,
    })
}