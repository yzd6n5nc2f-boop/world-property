import { requestJson } from "@/lib/api/http";
import { readStorage, storageKeys, writeStorage } from "@/lib/utils/storage";

type AuthState = {
  email: string;
  name: string;
  lastLoginAt: string;
};

export async function getAuthState() {
  return readStorage<AuthState | null>(storageKeys.authStub, null);
}

export async function signInStub(email: string, name: string) {
  const state = await requestJson<AuthState>("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, name, role: "user" })
  });

  writeStorage(storageKeys.authStub, state);
  return state;
}

export async function signOutStub() {
  await requestJson<{ ok: boolean }>("/api/auth/sign-out", {
    method: "POST"
  });
  writeStorage(storageKeys.authStub, null);
  return null;
}
