import { create } from "zustand";
import { uploadFileChunked } from "./api";
import { get, set } from "idb-keyval";

export type UploadStatus =
  | "PENDING"
  | "UPLOADING"
  | "PAUSED"
  | "SUCCESS"
  | "ERROR"
  | "CANCELED";

export interface UploadItem {
  id: string; // Client-side UUID cho mỗi item trong hàng đợi
  uploadId?: string; // Server-side UUID để resume (lấy từ backend)
  file: File;
  folderId: string;
  progress: number;
  status: UploadStatus;
  errorMessage?: string;
  abortController?: AbortController;
}

interface UploadError {
  name?: string;
  message?: string;
  code?: string;
  response?: {
    data?: {
      message?: string;
      msg?: string;
    };
  };
}

interface UploadStore {
  items: UploadItem[];
  addFiles: (files: File[], folderId: string) => void;
  pauseUpload: (id: string) => void;
  resumeUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  clearCompleted: () => void;
  _setItems: (
    items: UploadItem[] | ((prev: UploadItem[]) => UploadItem[]),
  ) => void;
  _processQueue: () => void;
}

// Global reference để gọi processQueue liên tục (hoặc trigger từ effect)
let isProcessing = false;
const DB_KEY = "sharingfileweb-upload-store";

async function saveQueueToDB(items: UploadItem[]) {
  try {
    const toSave = items.map((it) => ({
      ...it,
      abortController: undefined, // AbortController is not structured-clonable
    }));
    await set(DB_KEY, toSave);
  } catch (e) {
    console.warn("Failed to save upload queue to IndexedDB:", e);
  }
}

export const useUploadStore = create<UploadStore>((set, get) => {
  const processQueue = async () => {
    if (isProcessing) return;

    const { items, _setItems } = get();
    // Đang có file nào upload không? (Chỉ upload 1 file lúc này)
    const isUploading = items.some((item) => item.status === "UPLOADING");
    if (isUploading) return;

    // Wait, if UPLOADING is there, it was caught by isUploading check. So we look for PENDING.
    const pendingItem = items.find((item) => item.status === "PENDING");
    if (!pendingItem) return;

    isProcessing = true;
    const abortController = new AbortController();

    _setItems((prev) =>
      prev.map((it) =>
        it.id === pendingItem.id
          ? { ...it, status: "UPLOADING", abortController }
          : it,
      ),
    );

    try {
      await uploadFileChunked(pendingItem.file, pendingItem.folderId, {
        existingUploadId: pendingItem.uploadId,
        signal: abortController.signal,
        onUploadIdGenerated: (uploadId) => {
          _setItems((prev) =>
            prev.map((it) =>
              it.id === pendingItem.id ? { ...it, uploadId } : it,
            ),
          );
        },
        checkIsPaused: () => {
          const currentItem = get().items.find(
            (it) => it.id === pendingItem.id,
          );
          return (
            currentItem?.status === "PAUSED" ||
            currentItem?.status === "CANCELED"
          );
        },
        onProgress: (progress) => {
          _setItems((prev) =>
            prev.map((it) =>
              it.id === pendingItem.id ? { ...it, progress } : it,
            ),
          );
        },
      });

      // After a short wait for the final response (uploadFileChunked completes it)
      const finalItem = get().items.find((it) => it.id === pendingItem.id);
      if (finalItem && finalItem.status === "UPLOADING") {
        _setItems((prev) =>
          prev.map((it) =>
            it.id === pendingItem.id
              ? { ...it, status: "SUCCESS", progress: 100 }
              : it,
          ),
        );
        // Dispatch custom event to let React Query know it should refetch
        // using useQueryClient inside components
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("upload-success"));
        }
      }
    } catch (error: unknown) {
      const err = error as UploadError;
      const currentItem = get().items.find((it) => it.id === pendingItem.id);
      if (currentItem?.status === "CANCELED") {
        // Do nothing, it was canceled.
      } else if (
        err.message === "UPLOAD_PAUSED" ||
        currentItem?.status === "PAUSED"
      ) {
        // Paused intentionally
      } else if (err.name === "AbortError") {
        // Aborted request
      } else {
        // Actual error
        let errorMsg =
          err.response?.data?.msg || err.response?.data?.message || err.message;
        if (
          err.code === "ECONNABORTED" ||
          err.message?.toLowerCase().includes("timeout")
        ) {
          errorMsg = "Lỗi phản hồi máy chủ: Phản hồi quá lâu (Timeout)";
        }
        _setItems((prev) =>
          prev.map((it) =>
            it.id === pendingItem.id
              ? { ...it, status: "ERROR", errorMessage: errorMsg }
              : it,
          ),
        );
      }
    } finally {
      isProcessing = false;
      // Kích hoạt file tiếp theo
      setTimeout(() => get()._processQueue(), 500);
    }
  };

  return {
    items: [],
    _setItems: (update) =>
      set((state) => ({
        items: typeof update === "function" ? update(state.items) : update,
      })),
    _processQueue: processQueue,

    addFiles: (files: File[], folderId: string) => {
      const newItems = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        folderId,
        progress: 0,
        status: "PENDING" as UploadStatus,
      }));
      set((state) => {
        const nextItems = [...state.items, ...newItems];
        saveQueueToDB(nextItems);
        return { items: nextItems };
      });
      get()._processQueue();
    },

    pauseUpload: (id: string) => {
      set((state) => {
        const nextItems = state.items.map((item) => {
          if (item.id === id) {
            item.abortController?.abort();
            return { ...item, status: "PAUSED" as UploadStatus };
          }
          return item;
        });
        saveQueueToDB(nextItems);
        return { items: nextItems };
      });
      get()._processQueue(); // to start the next one
    },

    retryUpload: (id: string) => {
      set((state) => {
        const nextItems = state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "PENDING" as UploadStatus,
                errorMessage: undefined,
              }
            : item,
        );
        saveQueueToDB(nextItems);
        return { items: nextItems };
      });
      get()._processQueue();
    },

    resumeUpload: (id: string) => {
      set((state) => {
        const nextItems = state.items.map((item) =>
          item.id === id
            ? { ...item, status: "PENDING" as UploadStatus }
            : item,
        );
        saveQueueToDB(nextItems);
        return { items: nextItems };
      });
      get()._processQueue();
    },

    cancelUpload: (id: string) => {
      set((state) => {
        const itemToCancel = state.items.find((it) => it.id === id);
        if (itemToCancel) {
          itemToCancel.abortController?.abort();
        }
        const nextItems = state.items.filter((item) => item.id !== id);
        saveQueueToDB(nextItems);
        return { items: nextItems };
      });
      get()._processQueue();
    },

    moveUp: (id: string) => {
      set((state) => {
        const index = state.items.findIndex((it) => it.id === id);
        if (index <= 0) return state; // Đã ở đầu hoặc không thấy

        // Không cho phép vượt qua file đang UPLOADING
        const prevItem = state.items[index - 1];
        if (prevItem.status === "UPLOADING") return state;

        const newItems = [...state.items];
        [newItems[index - 1], newItems[index]] = [
          newItems[index],
          newItems[index - 1],
        ];
        return { items: newItems };
      });
    },

    moveDown: (id: string) => {
      set((state) => {
        const index = state.items.findIndex((it) => it.id === id);
        if (index < 0 || index === state.items.length - 1) return state;

        const newItems = [...state.items];
        [newItems[index], newItems[index + 1]] = [
          newItems[index + 1],
          newItems[index],
        ];
        return { items: newItems };
      });
    },

    clearCompleted: () => {
      set((state) => {
        const nextItems = state.items.filter(
          (item) => item.status !== "SUCCESS" && item.status !== "CANCELED",
        );
        saveQueueToDB(nextItems);
        return { items: nextItems };
      });
    },
  };
});

export async function initUploadStore() {
  if (typeof window === "undefined") return;
  try {
    const stored = await get<UploadItem[]>(DB_KEY);
    if (stored && stored.length > 0) {
      const restored = stored.map((item) => {
        // Any previously UPLOADING items were interrupted and are naturally paused.
        if (item.status === "UPLOADING") {
          return { ...item, status: "PAUSED" as UploadStatus };
        }
        return item;
      });
      useUploadStore.setState({ items: restored });
      useUploadStore.getState()._processQueue();
    }
  } catch (err) {
    console.warn("Failed to initialize upload store from DB", err);
  }
}
