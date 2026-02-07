export async function requestJson<T>(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: init.cache ?? "no-store"
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parse failures and keep generic message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
