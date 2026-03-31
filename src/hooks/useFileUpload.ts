import { useState } from "react";

interface UploadOptions {
  onSuccess?: (storageId: string, previewUrl: string) => void;
  onError?: (err: Error) => void;
}

export function useFileUpload(getUploadUrl: () => Promise<string>, options: UploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File): Promise<{ storageId: string; previewUrl: string } | null> => {
    setUploading(true);
    setProgress(0);
    try {
      const url = await getUploadUrl();
      const storageId = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve((JSON.parse(xhr.responseText) as { storageId: string }).storageId);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
        xhr.send(file);
      });
      const previewUrl = URL.createObjectURL(file);
      options.onSuccess?.(storageId, previewUrl);
      return { storageId, previewUrl };
    } catch (err) {
      options.onError?.(err instanceof Error ? err : new Error(String(err)));
      setProgress(0);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
}
