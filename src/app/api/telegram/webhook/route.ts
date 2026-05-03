import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramUser = {
  id?: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TelegramChat = {
  id: number;
  type?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  title?: string;
};

type TelegramMessage = {
  message_id: number;
  text?: string;
  chat: TelegramChat;
  from?: TelegramUser;
  reply_to_message?: {
    text?: string;
  };
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

const telegramTimeoutMs = 4000;

export async function GET() {
  return NextResponse.json({ ok: true, service: "ethnic-house-telegram-webhook" });
}

export async function POST(request: Request) {
  const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  if (configuredSecret) {
    const requestSecret = request.headers.get("x-telegram-bot-api-secret-token");

    if (requestSecret !== configuredSecret) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }
  }

  let update: TelegramUpdate;

  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const message = update.message;
  const text = message?.text?.trim();

  if (!message || !text || message.from?.is_bot) {
    return NextResponse.json({ ok: true });
  }

  const ownerChatId = process.env.TELEGRAM_CHAT_ID?.trim();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!ownerChatId || !botToken) {
    return NextResponse.json({ ok: true, message: "Telegram contact is not configured." });
  }

  const currentChatId = String(message.chat.id);

  try {
    if (currentChatId === ownerChatId) {
      await handleOwnerReply(message, ownerChatId);
    } else {
      await forwardVisitorMessage(message, ownerChatId);
    }
  } catch (error) {
    console.warn("[telegram-webhook]", error);
  }

  return NextResponse.json({ ok: true });
}

async function handleOwnerReply(message: TelegramMessage, ownerChatId: string) {
  const commandReply = parseReplyCommand(message.text ?? "");
  const replyToChatId = parseForwardedChatId(message.reply_to_message?.text ?? "");
  const targetChatId = commandReply?.chatId ?? replyToChatId;
  const replyBody = commandReply?.body ?? message.text?.trim();

  if (!targetChatId || !replyBody) {
    await sendTelegramMessage(ownerChatId, "Reply to a forwarded visitor message, or use: /reply CHAT_ID message");
    return;
  }

  await sendTelegramMessage(targetChatId, replyBody);
  await sendTelegramMessage(ownerChatId, `Sent to Telegram contact ${targetChatId}.`);
}

async function forwardVisitorMessage(message: TelegramMessage, ownerChatId: string) {
  const visitorChatId = String(message.chat.id);
  const visitorName = formatTelegramName(message.from, message.chat);
  const text = [
    "New ETHNIC HOUSE Telegram contact",
    `From: ${visitorName}`,
    `Chat ID: ${visitorChatId}`,
    "",
    message.text?.trim() ?? "",
    "",
    "Reply directly to this message, or use:",
    `/reply ${visitorChatId} your message`
  ].join("\n");

  await sendTelegramMessage(ownerChatId, text, {
    reply_markup: {
      force_reply: true,
      input_field_placeholder: "Type reply for this visitor"
    }
  });

  await sendTelegramMessage(
    visitorChatId,
    "Thanks. ETHNIC HOUSE received your message and will reply here."
  );
}

function formatTelegramName(user?: TelegramUser, chat?: TelegramChat) {
  const username = user?.username ?? chat?.username;
  const fullName = [user?.first_name ?? chat?.first_name, user?.last_name ?? chat?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (username) {
    return `${fullName || username} (@${username})`;
  }

  return fullName || chat?.title || "Telegram visitor";
}

function parseReplyCommand(text: string) {
  const match = text.match(/^\/reply(?:@\w+)?\s+(-?\d+)\s+([\s\S]+)$/);

  if (!match) {
    return null;
  }

  const chatId = match[1];
  const body = match[2]?.trim();

  if (!chatId || !body) {
    return null;
  }

  return {
    chatId,
    body
  };
}

function parseForwardedChatId(text: string) {
  return text.match(/Chat ID:\s*(-?\d+)/)?.[1] ?? null;
}

async function sendTelegramMessage(
  chatId: string,
  text: string,
  extraPayload: Record<string, unknown> = {}
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!botToken) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), telegramTimeoutMs);

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
        ...extraPayload
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Telegram sendMessage failed: ${response.status} ${responseBody.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}
