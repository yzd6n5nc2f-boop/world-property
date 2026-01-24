export const storageKeys = {
  listings: "wp_listings_user",
  savedListings: "wp_saved_listings",
  savedSearches: "wp_saved_searches",
  authStub: "wp_auth_stub"
} as const;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return fallback;
  }
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return safeParse<T>(window.localStorage.getItem(key), fallback);
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
