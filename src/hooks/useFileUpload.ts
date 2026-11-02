import type { Id } from "convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useToast } from "@/components/ui/Toast";
import { MAX_IMAGE_BYTES } from "@/lib/constants";

const INVALID_TYPE_MESSAGE = "Please select an image file";
const TOO_LARGE_MESSAGE = `Image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`;
const uploadResponseSchema = z.object({ storageId: z.string().min(1) });

export function useFileUpload(
  getUploadUrl: () => Promise<string>,
  options: {
    onSuccess?: (storageId: Id<"_storage">, previewUrl: string) => void;
    onError?: (error: Error) => void;
  } = {},
) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const upload = async (file: File): Promise<{ storageId: Id<"_storage">; previewUrl: string } | null> => {
    if (!file.type.startsWith("image/")) {
      toast(INVALID_TYPE_MESSAGE, "error");
      return null;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast(TOO_LARGE_MESSAGE, "error");
      return null;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);
    setProgress(0);

    try {
      const url = await getUploadUrl();
      const storageId = await new Promise<Id<"_storage">>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error(`Upload failed: ${xhr.status}`));
            return;
          }
          try {
            const parsed = uploadResponseSchema.parse(JSON.parse(xhr.responseText));
            resolve(parsed.storageId as Id<"_storage">);
          } catch {
            reject(new Error("Invalid upload response"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.onabort = () => reject(new DOMException("Upload aborted", "AbortError"));
        controller.signal.addEventListener("abort", () => xhr.abort(), { once: true });
        xhr.send(file);
      });

      setProgress(100);
      const previewUrl = URL.createObjectURL(file);
      options.onSuccess?.(storageId, previewUrl);
      return { storageId, previewUrl };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return null;
      setProgress(0);
      options.onError?.(error instanceof Error ? error : new Error(String(error)));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await upload(file);
  };

  return { upload, handleInputChange, uploading, progress };
}
