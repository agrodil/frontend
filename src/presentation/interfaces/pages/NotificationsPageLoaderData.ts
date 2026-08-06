export interface Chat {
  purchase_notification_id: string;
  sent_by: string;
  sent_to: string;
  post_id: string | null;
  purchase_notification_type_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  other_user_id: string;
  other_user_name: string;
  post_name: string | null;
}

export interface Message {
  purchase_notification_id: string;
  sent_by: string;
  sent_to: string;
  post_id: string | null;
  purchase_notification_type_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  post_name: string | null;
}

export interface ChatPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface NotificationsPageLoaderData {
  items: Chat[];
  pagination?: ChatPagination;
  error?: string;
}
