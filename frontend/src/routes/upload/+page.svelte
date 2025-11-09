<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { apiFetch } from "$lib/api";

  let { data } = $props();

  let form = $state({
    title: "",
    description: "",
    isPublic: true,
    file: null as File | null,
  });

  let loading = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");
  let uploadStep = $state<"idle" | "request" | "upload" | "save">("idle");

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    form.file = input.files?.[0] ?? null;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!data.user) {
      errorMessage = "사진을 업로드하려면 로그인해주세요.";
      return;
    }

    if (!form.file) {
      errorMessage = "이미지 파일을 선택해주세요.";
      return;
    }

    loading = true;
    uploadStep = "request";
    errorMessage = "";
    successMessage = "";

    try {
      const presigned = await apiFetch<{
        key: string;
        uploadUrl: string;
        fields: Record<string, string>;
        publicUrl: string;
        expiresIn: number;
      }>("/api/photos/upload-url", {
        data: {
          fileName: form.file.name,
          contentType: form.file.type || "application/octet-stream",
          fileSize: form.file.size,
        },
      });

      uploadStep = "upload";

      const formData = new FormData();
      Object.entries(presigned!.fields ?? {}).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", form.file);

      const uploadResponse = await fetch(presigned!.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("S3 업로드에 실패했습니다. 다시 시도해주세요.");
      }

      uploadStep = "save";

      await apiFetch("/api/photos", {
        data: {
          title: form.title,
          description: form.description,
          isPublic: form.isPublic,
          imageKey: presigned!.key,
        },
      });

      successMessage = "사진이 업로드되었습니다! 내 갤러리로 이동합니다.";
      setTimeout(() => goto(`/user/${data.user!.username}`), 800);
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : "업로드에 실패했습니다. 다시 시도해주세요.";
    } finally {
      loading = false;
      uploadStep = "idle";
    }
  }
</script>

<section class="space-y-6">
  <div>
    <h1 class="text-3xl font-semibold text-white">사진 업로드</h1>
    <p class="text-muted mt-2">
      제목과 설명을 입력하고 사진을 업로드하세요. 공개 여부도 선택할 수 있습니다.
    </p>
  </div>

  {#if !data.user}
    <p class="text-sm font-semibold text-rose-300" role="alert">
      사진을 올리려면
      <a href="/login?redirect={encodeURIComponent(page.url.pathname + page.url.search)}">
        로그인
      </a>이 필요합니다.
    </p>
  {/if}

  {#if errorMessage}
    <p class="text-sm font-semibold text-rose-300" role="alert">{errorMessage}</p>
  {/if}
  {#if successMessage}
    <p class="text-sm font-semibold text-emerald-300" role="status">{successMessage}</p>
  {/if}

  <form class="space-y-5" onsubmit={handleSubmit}>
    <div class="space-y-2">
      <label class="text-sm font-semibold text-white" for="title">제목</label>
      <input
        id="title"
        name="title"
        placeholder="사진 제목"
        required
        maxlength="120"
        bind:value={form.title}
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-white" for="description">설명</label>
      <textarea
        id="description"
        name="description"
        placeholder="사진에 대해 설명해주세요 (최대 500자)"
        maxlength="500"
        bind:value={form.description}
      ></textarea>
    </div>

    <div class="space-y-2">
      <label class="flex items-center gap-3 text-sm font-semibold text-white">
        <input type="checkbox" bind:checked={form.isPublic} />
        전체공개로 업로드
      </label>
      <small class="text-muted text-xs">
        체크하지 않으면 본인과 링크를 가진 사람만 확인할 수 있습니다.
      </small>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-white" for="image">이미지 파일</label>
      <input
        class="cursor-pointer border-dashed"
        id="image"
        name="image"
        type="file"
        accept="image/*"
        onchange={handleFileChange}
      />
    </div>

    <button class="btn-primary" type="submit" disabled={loading || !data.user}>
      {#if !loading}
        사진 업로드
      {:else if uploadStep === "request"}
        업로드 URL 요청 중...
      {:else if uploadStep === "upload"}
        S3에 전송 중...
      {:else if uploadStep === "save"}
        메타데이터 저장 중...
      {:else}
        업로드 중...
      {/if}
    </button>
  </form>
</section>
