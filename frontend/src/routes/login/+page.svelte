<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { apiFetch } from "$lib/api";

  let form = $state({
    username: "",
    password: "",
  });

  let loading = $state(false);
  let errorMessage = $state("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    loading = true;
    errorMessage = "";

    try {
      await apiFetch("/api/auth/login", { data: form });
      await invalidateAll();
      goto(page.url.searchParams.get("redirect") || "/");
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : "로그인에 실패했습니다. 다시 시도해주세요.";
    } finally {
      loading = false;
    }
  }
</script>

<section class="mx-auto max-w-lg space-y-6">
  <div>
    <h1 class="text-3xl font-semibold text-white">로그인</h1>
    <p class="text-muted mt-2">아이디와 비밀번호로 로그인하세요.</p>
  </div>

  {#if errorMessage}
    <p class="text-sm font-semibold text-rose-300" role="alert">{errorMessage}</p>
  {/if}

  <form class="space-y-5" onsubmit={handleSubmit}>
    <div class="space-y-2">
      <label class="text-sm font-semibold text-white" for="username">아이디</label>
      <input
        id="username"
        name="username"
        placeholder="아이디를 입력하세요"
        required
        bind:value={form.username}
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-white" for="password">비밀번호</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="비밀번호를 입력하세요"
        required
        bind:value={form.password}
      />
    </div>

    <button class="btn-primary" type="submit" disabled={loading}>
      {loading ? "로그인 중..." : "로그인"}
    </button>
  </form>
</section>
