import type { PostFile } from "@/entities/PostFile.interface";
import { awsApi } from "@/api/clients/aws.api";

export const getFilesByPost = async (data: string): Promise<PostFile[]> => {
  const response = await awsApi.getFilesByPost(data);
  // response ya es el array de archivos extraído por awsApi
  console.log("log from aws.actions: ", response);
  return response;
};
