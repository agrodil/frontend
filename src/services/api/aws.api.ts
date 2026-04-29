import { url } from "..";

export type PostFile = {
  app_file_id: string;
  app_file_name: string;
  mime_type: string;
  s3_key: string;
  is_main_file: boolean;
  display_order: number;
  url: string;
};

export const awsApi = {
  getFilesByPost: async (livestockPostId: string): Promise<PostFile[]> => {
    const response = await fetch(
      `${url}/aws/files/post/${livestockPostId}`,
    );
    if (!response.ok) throw new Error("Failed to fetch post files");
    const json = await response.json();
    return (json.data?.files ?? []) as PostFile[];
  },
};
