const DEFAULT_MEETING_BASE_URL = "https://meet.jit.si";
const DEFAULT_ROOM_PREFIX = "solohub-demo";

function normalizeBaseUrl(raw: string | undefined) {
  if (!raw) return DEFAULT_MEETING_BASE_URL;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function buildRoomCode() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  return `${datePart}-${randomPart}`;
}

export function generateDemoMeetingLink() {
  const baseUrl = normalizeBaseUrl(process.env.DEMO_MEETING_BASE_URL);
  const roomPrefix = (process.env.DEMO_MEETING_ROOM_PREFIX ?? DEFAULT_ROOM_PREFIX).trim() || DEFAULT_ROOM_PREFIX;
  const roomName = `${roomPrefix}-${buildRoomCode()}`;
  return `${baseUrl}/${roomName}`;
}

