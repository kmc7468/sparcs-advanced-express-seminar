<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { apiFetch } from "$lib/api";

  let form = $state({
    username: "",
    password: "",
    passwordConfirm: "",
  });
  let passwordMismatch = $derived(
    Boolean(form.password && form.passwordConfirm && form.password !== form.passwordConfirm),
  );

  let loading = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (passwordMismatch) {
      errorMessage = "비밀번호가 일치하지 않습니다.";
      return;
    }

    loading = true;
    errorMessage = "";
    successMessage = "";

    try {
      await apiFetch("/api/auth/register", { data: form });
      await invalidateAll();
      successMessage = "회원가입이 완료되었습니다! 잠시 후 이동합니다.";
      setTimeout(() => goto(page.url.searchParams.get("redirect") || "/"), 800);
    } catch (err) {
      errorMessage =
        err instanceof Error ? err.message : "회원가입에 실패했습니다. 다시 시도해주세요.";
    } finally {
      loading = false;
    }
  }
</script>

<section class="mx-auto max-w-lg space-y-6">
  <div>
    <h1 class="text-3xl font-semibold text-white">회원가입</h1>
    <p class="text-muted mt-2">새로운 계정을 만들고 사진을 공유해보세요.</p>
  </div>

  {#if errorMessage}
    <p class="text-sm font-semibold text-rose-300" role="alert">{errorMessage}</p>
  {/if}
  {#if successMessage}
    <p class="text-sm font-semibold text-emerald-300" role="status">{successMessage}</p>
  {/if}

  <form class="space-y-5" onsubmit={handleSubmit}>
    <div class="space-y-2">
      <label class="text-sm font-semibold text-white" for="username">아이디</label>
      <input
        id="username"
        name="username"
        placeholder="영문, 숫자, 언더스코어 조합 3~32자"
        minlength="3"
        maxlength="32"
        pattern={"[A-Za-z0-9_]{3,32}"}
        required
        bind:value={form.username}
      />
      <small class="text-muted text-xs">예: sparcs_static</small>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-white" for="password">비밀번호</label>
      <input
        id="password"
        name="password"
        type="password"
        minlength="8"
        maxlength="64"
        placeholder="8자 이상 입력해주세요"
        required
        bind:value={form.password}
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-semibold text-white" for="passwordConfirm">비밀번호 확인</label>
      <input
        id="passwordConfirm"
        name="passwordConfirm"
        type="password"
        minlength="8"
        maxlength="64"
        placeholder="비밀번호를 다시 입력해주세요"
        required
        bind:value={form.passwordConfirm}
      />
      {#if passwordMismatch}
        <p class="text-sm font-semibold text-rose-300">비밀번호가 일치하지 않습니다.</p>
      {/if}
    </div>

    <button class="btn-primary" type="submit" disabled={loading || passwordMismatch}>
      {loading ? "회원가입 중..." : "회원가입"}
    </button>
  </form>
</section>
