<script lang="ts">
  import { onMount } from 'svelte';
  import kaboom from 'kaboom';

  let canvasContainer: HTMLElement;
  let gameCanvas: HTMLCanvasElement;
  let gameFinished = false;
  let selectedBoxName = ""; // Track what the user clicked

  onMount(() => {
    const k = kaboom({
      // We don't need 'parent' if we strictly provide 'canvas'
      width: canvasContainer.offsetWidth,
      height: canvasContainer.offsetHeight,
      canvas: gameCanvas,
      background: [13, 17, 23],
    });

    const boxNames = ["SVN", "Mercurial", "Git", "Zip File"];
    
    boxNames.forEach((name, index) => {
      const xPos = (k.width() / (boxNames.length + 1)) * (index + 1);
      
      const box = k.add([
        k.rect(80, 80),
        k.pos(xPos, k.height() / 2),
        k.color(name === "Git" ? [145, 71, 255] : [100, 100, 100]),
        k.area(),
        k.anchor("center"),
        "repo",
        { name: name }
      ]);

      k.add([
        k.text(name, { size: 16 }),
        k.pos(xPos, k.height() / 2 - 60),
        k.anchor("center"),
      ]);

      // NEW: Selection Logic
      box.onClick(() => {
        selectedBoxName = name;
        // Visual feedback for selection
        k.get("repo").forEach(b => b.use(k.outline(0))); // Remove other outlines
        box.use(k.outline(4, [255, 255, 255])); // Add white outline to selected
      });
    });

    k.onKeyPress("down", () => {
      if (gameFinished || !selectedBoxName) return;

      k.get("repo").forEach((b) => {
        if (b.name === selectedBoxName) {
          b.move(0, 1500);
          k.shake(2);

          if (b.name === "Git" && b.pos.y > k.height() - 60) {
            gameFinished = true;
            showWinEffect(k);
          } else if (b.name !== "Git" && b.pos.y > k.height() - 60) {
              // Wrong box pulled!
              k.shake(10);
              b.pos.y = k.height() / 2; // Reset it
              alert(`That's ${b.name}, not Git! It won't break the internet correctly.`);
          }
        }
      });
    });
  });

  function showWinEffect(k) {
    k.add([
      k.text("PULL SUCCESSFUL", { size: 48 }),
      k.pos(k.center()),
      k.anchor("center"),
      k.color(0, 255, 0),
    ]);
  }
</script>

<style>
  .canvas-wrapper {
    position: relative;
    width: 100%;
    flex: 1;
    overflow: hidden;
  }
  
  .canvas-wrapper :global(canvas) {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }

  .top-bar {
    position: relative;
    z-index: 100;
    flex-shrink: 0;
  }
</style>

<main class="min-h-screen w-full bg-[#0d1117] flex flex-col items-center justify-center p-8">
  <!-- Game Container -->
  <div class="relative w-[800px] h-[600px] border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col bg-gray-900">
    
    <div class="top-bar p-4 bg-black/40 text-green-400 font-mono text-xl border-b border-gray-800">
      TASK: git pull {selectedBoxName ? `(Selected: ${selectedBoxName})` : "- Click a box to select"}
    </div>

    <div bind:this={canvasContainer} class="canvas-wrapper bg-[#0d1117]">
      <canvas bind:this={gameCanvas}></canvas>
    </div>

    {#if gameFinished}
      <div class="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-[50]">
        <div class="bg-gray-900 p-8 rounded-2xl border-2 border-purple-500 max-w-md text-center shadow-2xl animate-bounce">
          <h1 class="text-3xl font-bold text-purple-400 mb-4">Git Pull (Verb)</h1>
          <p class="text-xl text-white italic">
            "The act of using gravity and extreme physical force to drag a specific purple box into the floor until the internet breaks."
          </p>
          <button
            on:click={() => window.location.reload()}
            class="mt-6 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition pointer-events-auto"
          >
            Next Term: Git Push?
          </button>
        </div>
      </div>
    {/if}
  </div>

  
</main>