<script lang="ts">
  import { onMount } from 'svelte';
  import { LEVELS } from "$lib/config/levels";
  import { playedLevelIds } from "$lib/stores/game";
  import { get } from 'svelte/store';

  let nextLevelPath = "";
  let allLevelsComplete = false;

  onMount(() => {
    const played = get(playedLevelIds);
    const availableLevels = LEVELS.filter(l => !played.includes(l.id));

    if (availableLevels.length === 0) {
      allLevelsComplete = true;
    } else {
      // Pick a random level from available ones
      const randomLevel = availableLevels[Math.floor(Math.random() * availableLevels.length)];
      nextLevelPath = randomLevel.path;
    }
  });

  function logLevelStart() {
    if (!nextLevelPath) return;
    const level = LEVELS.find(l => l.path === nextLevelPath);
    if (level) {
      playedLevelIds.update(ids => [...ids, level.id]);
    }
  }
</script>

<main class="min-h-screen w-full bg-[#05070a] flex items-center justify-center p-4">
  <div class="fixed top-8 left-8 z-50">
    <a
      href="/"
      class="group flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:border-white/40 transition-all"
    >
      <span class="group-hover:-translate-x-1 transition-transform">←</span>
      <span class="text-sm font-medium">Back (Read)</span>
    </a>
  </div>
  <div class="text-center">
    <h1 class="text-5xl font-bold text-purple-400 mb-4">CS Myth Busted</h1>
    <p class="text-xl text-gray-300 mb-8">Learn what computer science terms actually mean...</p>
    {#if allLevelsComplete}
      <div class="text-2xl font-bold text-green-400 animate-pulse">
        All levels completed! Refresh to play again.
      </div>
    {:else if nextLevelPath}
      <a
        href={nextLevelPath}
        on:click={logLevelStart}
        class="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition-all transform hover:scale-110 text-lg"
      >
        Start Game →
      </a>
    {/if}
  </div>
</main>
