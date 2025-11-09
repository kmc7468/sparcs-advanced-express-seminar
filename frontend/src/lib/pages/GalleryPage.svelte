<script lang="ts">
  import type { Photo } from "$lib/types";

  interface Props {
    title: string;
    description: string;
    photos?: Photo[];
    emptyMessage?: string;
    errorMessage?: string;
  }

  let {
    title,
    description,
    photos = [],
    emptyMessage = "아직 표시할 사진이 없습니다.",
    errorMessage = "",
  }: Props = $props();

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function formatDate(value: string) {
    return formatter.format(new Date(value));
  }
</script>

<section class="space-y-6">
  <div>
    <h1 class="text-3xl font-semibold text-white">{title}</h1>
    <p class="text-muted mt-2">{description}</p>
  </div>

  {#if errorMessage}
    <p class="text-sm font-semibold text-rose-300" role="alert">{errorMessage}</p>
  {:else if photos.length === 0}
    <p class="text-muted py-10 text-center">{emptyMessage}</p>
  {:else}
    <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each photos as photo}
        <article
          class="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/40 backdrop-blur"
        >
          <img
            class="h-56 w-full object-cover"
            src={photo.imageUrl}
            alt={photo.title}
            loading="lazy"
            decoding="async"
          />
          <div class="flex flex-1 flex-col gap-4 px-5 pt-4 pb-6">
            <div class="flex items-center gap-2">
              <h3 class="flex-1 text-lg font-semibold text-white">{photo.title}</h3>
              {#if !photo.isPublic}
                <span class="badge-muted bg-white/5 text-slate-200">비공개</span>
              {/if}
            </div>
            {#if photo.description}
              <p class="text-muted text-sm">{photo.description}</p>
            {/if}
            <div class="flex items-center justify-between text-sm text-slate-300/80">
              <span class="flex items-center gap-1">
                <span aria-hidden="true">📸</span>
                <a class="font-semibold text-sky-300" href={`/user/${photo.username}`}>
                  @{photo.username}
                </a>
              </span>
              <span class="text-xs tabular-nums">{formatDate(photo.createdAt)}</span>
            </div>
          </div>
        </article>
      {/each}
    </section>
  {/if}
</section>

<style>
  .badge-muted {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 999px;
    padding: 0.15rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: rgba(226, 232, 240, 0.85);
  }
</style>
