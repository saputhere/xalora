export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

export async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (response.ok) {
    return { ok: true, data: payload as T };
  }

  return {
    ok: false,
    message: payload?.error?.message ?? "Something went wrong. Please try again.",
  };
}