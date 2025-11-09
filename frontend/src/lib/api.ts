import * as env from "$env/static/public";

const API_BASE_URL = env.PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type RequestOptions = Omit<RequestInit, "body"> & {
  data?: Record<string, unknown>;
  skipErrorStatuses?: number[];
  fetchImpl?: typeof fetch;
};

export async function apiFetch<TResponse = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse | null | undefined> {
  const { fetchImpl = fetch, ...rest } = options;
  const headers = new Headers(rest.headers);
  const requestInit: RequestInit = {
    method: rest.data ? "POST" : "GET",
    credentials: "include",
    ...rest,
    headers,
  };

  if (rest.data) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    requestInit.body = JSON.stringify(rest.data);
  }

  const response = await fetchImpl(`${API_BASE_URL}${path}`, requestInit);

  if (!response.ok) {
    if (rest.skipErrorStatuses?.includes(response.status)) {
      return null;
    }

    let message = response.statusText;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === "string") {
        message = errorBody.message;
      }
    } catch {
      // Ignore body parsing errors
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined;
  }

  return (await response.json()) as TResponse;
}
