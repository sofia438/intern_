

export type NotificationType = "search" | "campaign" | "lead";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  href: string;
  timestamp: string;
};
