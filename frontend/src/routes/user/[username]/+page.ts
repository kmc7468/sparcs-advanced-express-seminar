import { apiFetch } from "$lib/api";
import type { Photo } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, parent, fetch }) => {
  const { username } = params;
  const { user: currentUser } = await parent();
  const isOwner = currentUser?.username === username;

  try {
    const data = await apiFetch<{ photos: Photo[] }>(`/api/photos/user/${username}`, {
      fetchImpl: fetch,
    });

    return {
      username,
      isOwner,
      photos: data!.photos,
      subtitle: isOwner
        ? "비공개 사진도 모두 확인할 수 있습니다."
        : "전체공개된 사진만 확인할 수 있습니다.",
      emptyMessage: isOwner ? "아직 업로드한 사진이 없습니다." : "아직 공개된 사진이 없습니다.",
    };
  } catch (err) {
    return {
      username,
      isOwner,
      subtitle: "전체공개된 사진만 확인할 수 있습니다.",
      errorMessage: err instanceof Error ? err.message : "사진 목록을 불러오지 못했습니다.",
    };
  }
};
