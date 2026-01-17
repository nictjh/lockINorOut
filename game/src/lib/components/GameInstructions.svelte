<script lang="ts">
  import { fade, scale } from 'svelte/transition';

  export let title: string;
  export let instructions: string[];
  export let onStart: () => void;
  export let buttonText = "Start Game";

  let visible = true;

  function handleStart() {
    visible = false;
    onStart();
  }
</script>

{#if visible}
  <div 
    class="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    transition:fade={{ duration: 300 }}
  >
    <div 
      class="w-full max-w-md bg-[#0d1117] border-2 border-purple-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)]"
      in:scale={{ start: 0.95, duration: 300 }}
    >
      <h2 class="text-3xl font-bold text-white mb-6 text-center tracking-tight">
        {title}
      </h2>

      <div class="space-y-4 mb-8">
        {#each instructions as instruction}
          <div class="flex items-start gap-3">
            <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
            <p class="text-gray-300 text-lg leading-relaxed">{instruction}</p>
          </div>
        {/each}
      </div>

      <button
        on:click={handleStart}
        class="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-900/20"
      >
        {buttonText}
      </button>
    </div>
  </div>
{/if}
