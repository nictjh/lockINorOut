<script lang="ts">
  import { LEVELS } from "$lib/config/levels";
</script>

<svelte:head>
  <title>FocusLock - Curated Feed</title>
</svelte:head>

<main class="min-h-screen w-full bg-gradient-to-br from-[#05070a] via-[#0f1119] to-[#1a1d2e] p-8">
  <!-- Header -->
  <div class="max-w-6xl mx-auto mb-12">
    <h1 class="text-5xl font-bold text-white mb-2">Curated Feed</h1>
    <p class="text-xl text-gray-400">Your personalized reading list based on your interests</p>
  </div>

  <!-- Placeholder Grid -->
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each Array(6) as _, i}
      <div
        class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-all cursor-pointer group"
      >
        <!-- Placeholder Image -->
        <div class="w-full h-40 bg-gradient-to-br from-purple-900 to-slate-900 rounded-md mb-4 flex items-center justify-center border border-slate-600 group-hover:border-purple-400 transition-colors">
          <span class="text-slate-500 text-sm">Article {i + 1}</span>
        </div>

        <!-- Placeholder Content -->
        <h2 class="text-lg font-semibold text-white mb-2 bg-slate-700 h-6 rounded w-4/5"></h2>
        <p class="text-gray-400 text-sm mb-4 space-y-2">
          <span class="block bg-slate-700 h-4 rounded w-full"></span>
          <span class="block bg-slate-700 h-4 rounded w-5/6"></span>
        </p>

        <!-- Placeholder Meta -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-700">
          <span class="text-xs text-gray-500 bg-slate-700 h-4 rounded w-20"></span>
          <span class="text-xs text-gray-500 bg-slate-700 h-4 rounded w-16"></span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Settings Info -->
  <div class="max-w-6xl mx-auto mt-16 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
    <h3 class="text-lg font-semibold text-white mb-2">✨ Coming Soon</h3>
    <p class="text-gray-400">
      Your feed will be populated based on your interests and preferred websites. Configure your preferences in the VS Code settings.
    </p>
  </div>

  <!-- Navigation Link -->
  <div class="max-w-6xl mx-auto mt-8 text-center">
    <a
      href="/game"
      class="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
    >
      Play CS Terms Game →
    </a>
  </div>
</main>

<style lang="postcss">
  :global(body) {
    @apply bg-[#05070a];
  }
</style>