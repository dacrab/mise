import { useEffect, useRef, useState } from "react";

export function useFileUpload(
  getUploadUrl: () => Promise<string>,
  options: {
    onSuccess?: (storageId: string, previewUrl: string) => void;
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

  const upload = async (file: File): Promise<{ storageId: string; previewUrl: string } | null> => {
    abortRef.current = new AbortController();
    setUploading(true);
    setProgress(0);

    try {
      const url = await getUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { storageId } = (await res.json()) as { storageId: string };
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
