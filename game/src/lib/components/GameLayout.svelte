<script lang="ts">
  export let levelId: string = "";
  export let levelName: string = "";
  export let levelDescription: string = "";
  export let onComplete: (() => void) | null = null;

  let canvasContainer: HTMLElement;
  let gameCanvas: HTMLCanvasElement;
  let gameFinished = false;

  function handleNext() {
    if (onComplete) {
      onComplete();
    } else {
      window.location.href = "/";
    }
  }
</script>

<main class="min-h-screen w-full bg-[#05070a] flex items-center justify-center p-4">
  <div class="relative w-[800px] h-[600px] border-4 border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">

    <div class="p-4 bg-gray-900 text-green-400 font-mono text-lg border-b border-gray-800">
      $ {levelName}
    </div>

    <div bind:this={canvasContainer} class="canvas-wrapper flex-1 relative">
      <canvas bind:this={gameCanvas}></canvas>
      <slot {gameCanvas} {canvasContainer} bind:gameFinished />
    </div>

    {#if gameFinished}
      <div class="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div class="bg-gray-900 p-8 rounded-2xl border-2 border-purple-500 text-center shadow-2xl">
          <h1 class="text-3xl font-bold text-purple-400 mb-2">{levelName}</h1>
          <p class="text-white italic mb-6 opacity-80 text-lg">
            {levelDescription}
          </p>
          <button
            on:click={handleNext}
            class="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition-all transform hover:scale-110"
          >
            Back to Levels
          </button>
        </div>
      </div>
    {/if}
  </div>
</main>

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
    display: block;
  }
</style>
