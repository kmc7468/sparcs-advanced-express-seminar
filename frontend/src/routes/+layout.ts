import { apiFetch } from "$lib/api";
import type { User } from "$lib/types";
import type { LayoutLoad } from "./$types";

export const ssr = false;

export const load: LayoutLoad = async ({ fetch }) => {
  try {
    const data = await apiFetch<{ user: User }>("/api/auth/me", {
      skipErrorStatuses: [401],
      fetchImpl: fetch,
    });

    return {
      user: data?.user ?? null,
    };
  } catch {
    return { user: null };
  }
};
