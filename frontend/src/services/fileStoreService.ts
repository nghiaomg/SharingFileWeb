import api from "../lib/api";

export interface FileResponse {
  id: string;
  name: string;
  type: string;
  size: number;
  folderId: string | null;
  createdAt: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export const fileStoreService = {
  // Get all files in a folder (or root if null)
  getFiles: async (folderId?: string | null): Promise<FileResponse[]> => {
    const params = folderId ? { folderId } : {};
    const response = await api.get("/files", { params });
    return response.data;
  },

  // Delete a file
  deleteFile: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },

  // Upload file in chunks
  uploadFileChunked: async (
    file: File,
    folderId: string | null = null,
    onProgress?: (progress: number) => void
  ): Promise<FileResponse> => {
    
    // Validate File Size (Max 1GB)
    const MAX_SIZE = 1 * 1024 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      throw new Error("Dung lượng tệp vượt quá giới hạn 1GB.");
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    // Deterministic uploadId (Allows F5 to resume, safe for chars by using base64)
    const rawId = `${file.name}_${file.size}_${file.lastModified}`;
    const uploadId = btoa(encodeURIComponent(rawId));

    // Get previous uploaded chunks status
    let uploadedChunkIndexes: number[] = [];
    try {
      const { data } = await api.get(`/files/upload/status?uploadId=${uploadId}`);
      uploadedChunkIndexes = data || [];
    } catch (error) {
      console.error("Unable to check status, resuming from 0", error);
    }

    // If file is 0 bytes, we still upload 1 empty chunk
    const loopCount = totalChunks === 0 ? 1 : totalChunks;

    let uploadedChunksCount = uploadedChunkIndexes.length;

    // Trigger initial progress if we already have some chunks
    if (onProgress && uploadedChunkIndexes.length > 0) {
       const initialProgress = Math.round((uploadedChunksCount / loopCount) * 99);
       onProgress(initialProgress);
    }

    for (let chunkIndex = 0; chunkIndex < loopCount; chunkIndex++) {
      // SKIP if already uploaded
      if (uploadedChunkIndexes.includes(chunkIndex)) {
        continue;
      }

      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk, file.name);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("uploadId", uploadId);

      // Upload Chunk
      await api.post("/files/upload/chunk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update Progress
      uploadedChunksCount++;
      if (onProgress) {
        // Calculate total progress: 99% for chunks, keep 1% for merging
        const progress = Math.round((uploadedChunksCount / loopCount) * 99);
        onProgress(progress);
      }
    }

    // Call Complete Upload
    const completeFormData = new FormData();
    completeFormData.append("uploadId", uploadId);
    completeFormData.append("fileName", file.name);
    completeFormData.append("totalChunks", loopCount.toString());
    completeFormData.append("fileType", file.type || "application/octet-stream");
    completeFormData.append("fileSize", file.size.toString());
    if (folderId) {
      completeFormData.append("folderId", folderId);
    }

    const completeResponse = await api.post("/files/upload/complete", completeFormData);

    if (onProgress) {
        onProgress(100); // 100% finished
    }

    return completeResponse.data;
  }
};
