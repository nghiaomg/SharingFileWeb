import api from "../lib/api";

export interface FolderResponse {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const folderService = {
  // Get all root folders (parentId is null)
  getRootFolders: async (): Promise<FolderResponse[]> => {
    const response = await api.get("/folders");
    return response.data;
  },

  // Get a specific folder by ID
  getFolderById: async (id: string): Promise<FolderResponse> => {
    const response = await api.get(`/folders/${id}`);
    return response.data;
  },

  // Get children folders of a specific folder
  getFolderChildren: async (id: string): Promise<FolderResponse[]> => {
    const response = await api.get(`/folders/${id}/children`);
    return response.data;
  },

  // Create a new folder
  createFolder: async (name: string, parentId?: string | null): Promise<FolderResponse> => {
    const response = await api.post("/folders", { name, parentId });
    return response.data;
  },

  // Rename a folder
  updateFolder: async (id: string, name: string): Promise<FolderResponse> => {
    const response = await api.put(`/folders/${id}`, { name });
    return response.data;
  },

  // Delete a folder
  deleteFolder: async (id: string): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },
};
