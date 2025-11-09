<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { apiFetch } from "$lib/api";
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css";

  let { children, data } = $props();
  let logoutError = $state("");

  async function handleLogout() {
    logoutError = "";
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      await invalidateAll();
    } catch (err) {
      logoutError =
        err instanceof Error ? err.message : "로그아웃에 실패했습니다. 다시 시도해주세요.";
    }
  }

  function getEncodedCurrentPath() {
    if (page.url.pathname === "/login" || page.url.pathname === "/register") {
      return page.url.searchParams.get("redirect") || "/";
    }
    return encodeURIComponent(page.url.pathname + page.url.search);
  }
</script>

<svelte:head>
  <title>Mini Gallery</title>
  <link rel="icon" href={favicon} />
  <link
    rel="stylesheet"
    as="style"
    crossorigin="anonymous"
    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
  />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 pt-6 pb-16">
  <nav
    class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-4 shadow-2xl shadow-black/40 backdrop-blur"
  >
    <a class="text-lg font-extrabold tracking-wide text-white" href="/">Mini Gallery</a>

    <div class="flex flex-wrap items-center gap-3">
      {#if data.user}
        <span class="text-sm text-slate-300">
          안녕하세요, <strong class="text-sky-300">@{data.user.username}</strong>
        </span>
        <a class="btn-ghost" href="/upload">업로드</a>
        <a class="btn-ghost" href={`/user/${data.user.username}`}>내 갤러리</a>
        <button class="btn-ghost" type="button" onclick={handleLogout}>로그아웃</button>
      {:else}
        <a class="btn-ghost" href={`/login?redirect=${getEncodedCurrentPath()}`}>로그인</a>
        <a
          class="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:-translate-y-0.5"
          href={`/register?redirect=${getEncodedCurrentPath()}`}
        >
          회원가입
        </a>
      {/if}
    </div>
  </nav>

  {#if logoutError}
    <p class="mb-4 text-sm font-semibold text-rose-300" role="alert">{logoutError}</p>
  {/if}

  <main class="min-h-[calc(100vh-160px)]">
    <div class="card-panel">
      {@render children()}
    </div>
  </main>
</div>

<style>
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 999px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    color: #f8fafc;
    background: transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .btn-ghost:hover {
    border-color: #38bdf8;
    color: #bae6fd;
  }

  .card-panel {
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(15, 23, 42, 0.7);
    padding: 1.5rem;
    box-shadow: 0 25px 70px rgba(2, 6, 23, 0.55);
    backdrop-filter: blur(12px);
  }
</style>
