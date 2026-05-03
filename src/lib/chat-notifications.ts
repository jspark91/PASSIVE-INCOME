import type { ChatMessage, ChatSession } from "@/types/chat";
import { getSiteUrl } from "@/lib/site";

type NotificationPayload = {
  session: ChatSession;
  message: ChatMessage;
  adminUrl: string;
  text: string;
};

const notificationTimeoutMs = 4000;

export async function sendNewVisitorChatNotification(session: ChatSession) {
  const latestMessage = session.messages.at(-1);

  if (!latestMessage || latestMessage.sender !== "visitor") {
    return;
  }

  const payload = createNotificationPayload(session, latestMessage);
  const tasks = [sendTelegramNotification(payload), sendKakaoWebhookNotification(payload)];
  const results = await Promise.allSettled(tasks);

  for (const result of results) {
    if (result.status === "rejected") {
      console.warn("[chat-notification]", result.reason);
    }
  }
}

function createNotificationPayload(session: ChatSession, message: ChatMessage): NotificationPayload {
  const adminUrl = `${getSiteUrl()}/admin/chat?sessionId=${encodeURIComponent(session.id)}`;
  const contact = session.contact?.trim() || "-";
  const visitorName = session.name?.trim() || "Visitor";
  const text = [
    "New ETHNIC HOUSE chat",
    `Name: ${visitorName}`,
    `Contact: ${contact}`,
    `Message: ${message.body}`,
    "",
    `Open: ${adminUrl}`
  ].join("\n");

  return {
    session,
    message,
    adminUrl,
    text
  };
}

async function sendTelegramNotification(payload: NotificationPayload) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return;
  }

  await postJson("telegram", `https://api.telegram.org/bot${botToken}/sendMessage`, {
    chat_id: chatId,
    text: payload.text,
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [[{ text: "Open admin chat", url: payload.adminUrl }]]
    }
  });
}

async function sendKakaoWebhookNotification(payload: NotificationPayload) {
  const webhookUrl = process.env.KAKAO_ALERT_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return;
  }

  const webhookToken = process.env.KAKAO_ALERT_WEBHOOK_TOKEN?.trim();
  const headers: Record<string, string> = {};

  if (webhookToken) {
    headers.Authorization = `Bearer ${webhookToken}`;
  }

  await postJson(
    "kakao webhook",
    webhookUrl,
    {
      text: payload.text,
      sessionId: payload.session.id,
      adminUrl: payload.adminUrl,
      visitorName: payload.session.name,
      visitorContact: payload.session.contact,
      message: payload.message.body,
      createdAt: payload.message.created_at
    },
    headers
  );
}

async function postJson(
  targetName: string,
  url: string,
  payload: unknown,
  extraHeaders: Record<string, string> = {}
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), notificationTimeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(
        `${targetName} notification failed: ${response.status} ${responseBody.slice(0, 200)}`
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}
