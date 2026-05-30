import type { PostFile } from "@/entities/PostFile.interface";
import { url } from "..";

export const awsApi = {
  getFilesByPost: async (livestockPostId: string): Promise<PostFile[]> => {
    const response = await fetch(`${url}/aws/files/post/${livestockPostId}`);
    if (!response.ok) throw new Error("Failed to fetch post files");
    const json = await response.json();
    return json.data.files;
  },
};
