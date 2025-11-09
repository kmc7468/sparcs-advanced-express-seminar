<script lang="ts">
  import GalleryPage from "$lib/pages/GalleryPage.svelte";

  let { data } = $props();
</script>

<GalleryPage
  title={data.isOwner ? `내 갤러리` : `@${data.username} 님의 갤러리`}
  description={data.subtitle}
  photos={data.photos}
  emptyMessage={data.emptyMessage}
  errorMessage={data.errorMessage}
/>
