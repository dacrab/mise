import type { Id } from "convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { MAX_IMAGE_BYTES } from "@/lib/constants";

const INVALID_TYPE_MESSAGE = "Please select an image file";
const TOO_LARGE_MESSAGE = `Image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`;

export function useFileUpload<TStorageId extends string = Id<"_storage">>(
  getUploadUrl: () => Promise<string>,
  options: {
    onSuccess?: (storageId: TStorageId, previewUrl: string) => void;
    onError?: (err: Error) => void;
  } = {},
) {
  const { toast } = useToast();
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
    if (!file.type.startsWith("image/")) {
      toast(INVALID_TYPE_MESSAGE, "error");
      return null;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast(TOO_LARGE_MESSAGE, "error");
      return null;
    }

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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await upload(file);
  };

  return { upload, handleInputChange, uploading, progress };
}
