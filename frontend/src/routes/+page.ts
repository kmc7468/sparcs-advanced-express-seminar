import { apiFetch } from "$lib/api";
import type { Photo } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  try {
    const data = await apiFetch<{ photos: Photo[] }>("/api/photos", {
      fetchImpl: fetch,
    });

    return {
      photos: data!.photos,
    };
  } catch (err) {
    return {
      errorMessage: err instanceof Error ? err.message : "사진 목록을 불러오지 못했습니다.",
    };
  }
};
