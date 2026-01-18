<script lang="ts">
  import { onMount } from 'svelte';
  import kaboom from 'kaboom';

  let gameFinished = false;
  let gameCanvas: HTMLCanvasElement;

  onMount(() => {
    const k = kaboom({
      width: 800,
      height: 500,
      canvas: gameCanvas,
      background: [13, 17, 23],
    });

    k.add([
      k.text("Git Commit Level", { size: 32 }),
      k.pos(k.center()),
      k.anchor("center"),
      k.color(145, 71, 255),
    ]);

    k.add([
      k.text("(Placeholder - Coming Soon!)", { size: 16 }),
      k.pos(k.center().x, k.center().y + 50),
      k.anchor("center"),
      k.color(100, 100, 100),
    ]);

    k.onKeyPress("space", () => {
      gameFinished = true;
    });
  });
</script>

<style>
  .canvas-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: #0d1117;
  }
  
  :global(canvas) {
    width: 100% !important;
    height: 100% !important;
  }
</style>

<main class="min-h-screen w-full bg-[#05070a] flex items-center justify-center p-4 relative">
  <div class="fixed top-8 left-8 z-50">
    <a
      href="/game"
      class="group flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:border-white/40 transition-all"
    >
      <span class="group-hover:-translate-x-1 transition-transform">←</span>
      <span class="text-sm font-medium">Back (Read)</span>
    </a>
  </div>
  <div class="relative w-[800px] h-[600px] border-4 border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
    
    <div class="p-4 bg-gray-900 text-green-400 font-mono text-lg border-b border-gray-800">
      $ git commit
    </div>

    <div class="canvas-wrapper">
      <canvas bind:this={gameCanvas}></canvas>
    </div>

    {#if gameFinished}
      <div class="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div class="bg-gray-900 p-8 rounded-2xl border-2 border-purple-500 text-center shadow-2xl">
          <h1 class="text-3xl font-bold text-purple-400 mb-2">Git Commit</h1>
          <p class="text-white italic mb-6 opacity-80 text-lg">
            "Master the art of committing code!"
          </p>
          <a
            href="/"
            class="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition-all transform hover:scale-110"
          >
            Back to Levels
          </a>
        </div>
      </div>
    {/if}
  </div>
</main>
