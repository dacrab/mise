import { useEffect, useRef, useState } from "react";

interface UploadOptions {
  onSuccess?: (storageId: string, previewUrl: string) => void;
  onError?: (err: Error) => void;
}

export function useFileUpload(getUploadUrl: () => Promise<string>, options: UploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const mountedRef = useRef(true);
  const getUploadUrlRef = useRef(getUploadUrl);
  const optionsRef = useRef(options);

  getUploadUrlRef.current = getUploadUrl;
  optionsRef.current = options;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      xhrRef.current?.abort();
    };
  }, []);

  const upload = async (file: File): Promise<{ storageId: string; previewUrl: string } | null> => {
    xhrRef.current?.abort();
    if (mountedRef.current) {
      setUploading(true);
      setProgress(0);
    }

    try {
      const url = await getUploadUrlRef.current();
      const storageId = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("POST", url);
        xhr.timeout = 60_000;
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && mountedRef.current) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          xhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve((JSON.parse(xhr.responseText) as { storageId: string }).storageId);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });
        xhr.addEventListener("error", () => {
          xhrRef.current = null;
          reject(new Error("Network error"));
        });
        xhr.addEventListener("abort", () => {
          xhrRef.current = null;
          reject(new Error("Upload aborted"));
        });
        xhr.addEventListener("timeout", () => {
          xhrRef.current = null;
          reject(new Error("Upload timed out"));
        });
        xhr.send(file);
      });
      const previewUrl = URL.createObjectURL(file);
      optionsRef.current.onSuccess?.(storageId, previewUrl);
      return { storageId, previewUrl };
    } catch (err) {
      if (mountedRef.current) setProgress(0);
      optionsRef.current.onError?.(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      if (mountedRef.current) setUploading(false);
    }
  };

  return { upload, uploading, progress };
}
