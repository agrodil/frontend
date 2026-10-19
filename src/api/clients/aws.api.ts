import type { PostFile } from "@/entities/PostFile.interface";
import { url } from "..";

export const awsApi = {
  getFilesByPost: async (postId: string): Promise<PostFile[]> => {
    const response = await fetch(`${url}/aws/files/post/${postId}`);
    if (!response.ok) throw new Error("Failed to fetch post files");
    const json = await response.json();
    return json.data.files;
  },
};
