import { create } from "zustand";
import { getAllFiles } from "../services/files";

// Extend the Window interface to include the __TAURI__ property
declare global {
  interface Window {
    __TAURI__: {
      invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
    };
  }
}

type File = {
  file_id: number;
  case_number: string;
  purpose: string;
  uploaded_by: number;
  current_location: string;
  notes: string;
  required_on: string;
  date_returned: string | null;
};

type FileStore = {
  files: File[];
  loading: boolean;
  fetchFiles: () => Promise<void>;
  updateFileLocally: (updatedFile: File) => void;
};

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  loading: false,

  fetchFiles: async () => {
    set({ loading: true });
    try {
      const response = await getAllFiles(); // replace with your Tauri command

      set({ files: response as unknown as File[] });
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateFileLocally: (updatedFile) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.file_id === updatedFile.file_id ? updatedFile : f
      ),
    })),
}));
