import type { PostFile } from "@/interfaces/api/posts/PostFile.interface";
import { awsApi } from "@/services/api/aws.api";

export const getFilesByPost = async (data: string): Promise<PostFile[]> => {
  const response = await awsApi.getFilesByPost(data);
  // response ya es el array de archivos extraído por awsApi
  console.log("log from aws.actions: ", response);
  return response;
};
