export type ChatSender = "visitor" | "operator";

export type ChatSessionStatus = "open" | "closed";

export type ChatMessage = {
  id: string;
  session_id: string;
  sender: ChatSender;
  body: string;
  created_at: string;
};

export type ChatSession = {
  id: string;
  name: string;
  contact?: string | null;
  status: ChatSessionStatus;
  unread_by_operator: number;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  messages: ChatMessage[];
};
