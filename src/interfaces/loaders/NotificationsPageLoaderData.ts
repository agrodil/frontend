export interface Chat {
  purchase_notification_id: number;
  sent_by: string;
  livestock_post_id: string;
  purchase_notification_type_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  livestock_post_name: string;
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
}
