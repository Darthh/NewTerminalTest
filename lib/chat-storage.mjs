export const CHAT_KEY = "luna.chats.v1";
const statuses = new Set(["streaming", "complete", "failed", "interrupted"]);
const validDate = (value) =>
  typeof value === "string" && Number.isFinite(Date.parse(value));
const safeSource = (value) =>
  value &&
  typeof value.title === "string" &&
  typeof value.url === "string" &&
  (/^\/(?!\/)/.test(value.url) || /^https?:\/\//i.test(value.url));

/** Treat local storage as untrusted input so a corrupt record cannot crash the workspace. */
export function normalizeChat(chat) {
  if (
    !chat ||
    typeof chat.id !== "string" ||
    !/^[a-z0-9_-]{1,100}$/i.test(chat.id) ||
    !Array.isArray(chat.messages)
  )
    return null;
  const messages = chat.messages
    .filter(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string",
    )
    .map((message, index) => ({
      id:
        typeof message.id === "string" && message.id
          ? message.id.slice(0, 100)
          : `${chat.id}-message-${index}`,
      role: message.role,
      content: message.content.slice(0, 16000),
      ...(statuses.has(message.status) ? { status: message.status } : {}),
      ...(typeof message.model === "string"
        ? { model: message.model.slice(0, 80) }
        : {}),
      ...(Array.isArray(message.attachments)
        ? {
            attachments: message.attachments
              .filter((name) => typeof name === "string")
              .slice(0, 8)
              .map((name) => name.slice(0, 240)),
          }
        : {}),
      ...(Array.isArray(message.stocks)
        ? {
            stocks: [
              ...new Set(
                message.stocks.filter(
                  (symbol) =>
                    typeof symbol === "string" &&
                    /^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol),
                ),
              ),
            ].slice(0, 4),
          }
        : {}),
      ...(Array.isArray(message.sources)
        ? {
            sources: message.sources
              .filter(safeSource)
              .slice(0, 20)
              .map((source) => ({
                title: source.title.slice(0, 240),
                url: source.url.slice(0, 2000),
              })),
          }
        : {}),
    }));
  const createdAt = validDate(chat.createdAt)
    ? chat.createdAt
    : validDate(chat.updatedAt)
      ? chat.updatedAt
      : new Date().toISOString();
  return {
    id: chat.id,
    title:
      typeof chat.title === "string" && chat.title.trim()
        ? chat.title.trim().slice(0, 100)
        : messages
            .find((message) => message.role === "user")
            ?.content.slice(0, 64) || "Untitled research",
    createdAt,
    updatedAt: validDate(chat.updatedAt) ? chat.updatedAt : createdAt,
    messages,
  };
}

function normalizeArchive(value) {
  if (!Array.isArray(value)) return [];
  const ids = new Set();
  return value
    .map(normalizeChat)
    .filter((chat) => chat && !ids.has(chat.id) && (ids.add(chat.id) || true))
    .slice(0, 100);
}

export function readChats() {
  try {
    return normalizeArchive(JSON.parse(localStorage.getItem(CHAT_KEY) || "[]"));
  } catch {
    return [];
  }
}

export function writeChats(chats) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(normalizeArchive(chats)));
    window.dispatchEvent(new Event("luna-chats"));
    return true;
  } catch {
    return false;
  }
}

export function saveChat(chat) {
  const safe = normalizeChat(chat);
  if (!safe) return false;
  return writeChats([
    safe,
    ...readChats().filter((item) => item.id !== safe.id),
  ]);
}
