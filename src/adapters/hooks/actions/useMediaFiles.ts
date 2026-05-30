import { useState, useEffect } from "react";
import { getFilesByPost } from "@/presentation/router/actions/aws.actions";
import type { PostFile } from "@/entities/PostFile.interface";

export const useMediaFiles = (livestockPostId: string) => {
  const [mediaFiles, setMediaFiles] = useState<PostFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const loadFiles = async () => {
      try {
        const files = await getFilesByPost(livestockPostId);
        if (!cancelled) setMediaFiles(files);
      } catch (err) {
        if (!cancelled) {
          console.error("[useMediaFiles] Error loading files", err);
          setError("No se pudieron cargar los archivos");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadFiles();
    return () => {
      cancelled = true;
    };
  }, [livestockPostId]);

  return { mediaFiles, isLoading, error };
};
