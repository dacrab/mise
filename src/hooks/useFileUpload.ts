import type { Id } from "convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";

export function useFileUpload<TStorageId extends string = Id<"_storage">>(
  getUploadUrl: () => Promise<string>,
  options: {
    onSuccess?: (storageId: TStorageId, previewUrl: string) => void;
    onError?: (err: Error) => void;
  } = {},
) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const upload = async (file: File): Promise<{ storageId: TStorageId; previewUrl: string } | null> => {
    abortRef.current = new AbortController();
    setUploading(true);
    setProgress(0);

    try {
      const url = await getUploadUrl();
      const storageId = await new Promise<TStorageId>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const { storageId } = JSON.parse(xhr.responseText) as { storageId: string };
              resolve(storageId as TStorageId);
            } catch {
              reject(new Error("Invalid upload response"));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.onabort = () => reject(new DOMException("Upload aborted", "AbortError"));
        abortRef.current?.signal.addEventListener("abort", () => xhr.abort());
        xhr.send(file);
      });

      setProgress(100);
      const previewUrl = URL.createObjectURL(file);
      options.onSuccess?.(storageId, previewUrl);
      return { storageId, previewUrl };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return null;
      setProgress(0);
      options.onError?.(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
}
