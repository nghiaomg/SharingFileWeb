import api from "@/lib/api";
import { FolderResponse } from "./folderService";
import { FileResponse } from "./fileStoreService";

export interface TrashData {
  folders: FolderResponse[];
  files: FileResponse[];
}

export const trashService = {
  getTrashItems: async (): Promise<TrashData> => {
    const response = await api.get<TrashData>("/trash");
    return response.data;
  },

  restoreItem: async (type: "folder" | "file", id: string): Promise<unknown> => {
    const response = await api.put(`/trash/restore/${type}/${id}`);
    return response.data;
  },

  deletePermanent: async (type: "folder" | "file", id: string): Promise<unknown> => {
    const response = await api.delete(`/trash/permanent/${type}/${id}`);
    return response.data;
  }
};
