<script lang="ts">
  import { onMount } from 'svelte';
  import { LEVELS } from "$lib/config/levels";

  let nextLevelPath = "";

  onMount(() => {
    // Pick a random level (includes all available levels)
    const randomLevel = LEVELS[Math.floor(Math.random() * LEVELS.length)];
    nextLevelPath = randomLevel.path;
  });
</script>

<main class="min-h-screen w-full bg-[#05070a] flex items-center justify-center p-4">
  <div class="text-center">
    <h1 class="text-5xl font-bold text-purple-400 mb-4">CS Terms Wrong</h1>
    <p class="text-xl text-gray-300 mb-8">Learn what computer science terms actually mean...</p>
    {#if nextLevelPath}
      <a
        href={nextLevelPath}
        class="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition-all transform hover:scale-110 text-lg"
      >
        Start Game →
      </a>
    {/if}
  </div>
</main>