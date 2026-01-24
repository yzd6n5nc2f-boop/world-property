import { readStorage, storageKeys, writeStorage } from "@/lib/utils/storage";

type AuthState = {
  email: string;
  name: string;
  lastLoginAt: string;
};

const latency = 120;

function delay<T>(value: T) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(value), latency));
}

export async function getAuthState() {
  return delay(readStorage<AuthState | null>(storageKeys.authStub, null));
}

export async function signInStub(email: string, name: string) {
  const state: AuthState = {
    email,
    name,
    lastLoginAt: new Date().toISOString()
  };
  writeStorage(storageKeys.authStub, state);
  return delay(state);
}

export async function signOutStub() {
  writeStorage(storageKeys.authStub, null);
  return delay(null);
}
