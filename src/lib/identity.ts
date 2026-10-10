/** ID do streamer: Firebase uid quando logado, senão localStorage. */

const KEY = "aqtv_streamer_id";
const NAME_KEY = "aqtv_streamer_name";

export function getOrCreateStreamerId(firebaseUid?: string | null): string {
  if (firebaseUid) return firebaseUid;
  if (typeof window === "undefined") return "guest";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function getStreamerName(displayName?: string | null): string {
  if (displayName) return displayName;
  if (typeof window === "undefined") return "Meu Canal";
  return localStorage.getItem(NAME_KEY) || "Meu Canal";
}

export function setStreamerName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name.slice(0, 60));
}

export function getUsernameFromId(id: string) {
  return id.replace(/^s_/, "user_").slice(0, 24);
}
