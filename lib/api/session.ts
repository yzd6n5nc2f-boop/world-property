import { readStorage, storageKeys, writeStorage } from "@/lib/utils/storage";

type AuthState = {
  email: string;
};

function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "server";

  const existing = readStorage<string | null>(storageKeys.deviceId, null);
  if (existing) return existing;

  const next = crypto.randomUUID();
  writeStorage(storageKeys.deviceId, next);
  return next;
}

export function getSessionHeaders() {
  const headers: Record<string, string> = {
    "x-device-id": getOrCreateDeviceId()
  };
  const auth = readStorage<AuthState | null>(storageKeys.authStub, null);
  if (auth?.email) {
    headers["x-user-email"] = auth.email;
  }
  return headers;
}
