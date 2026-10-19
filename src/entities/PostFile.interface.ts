export interface PostFile {
  app_file_id: string;
  app_file_name: string;
  mime_type: string;
  s3_key: string;
  is_main_file: boolean;
  display_order: number;
  url: string;
}
