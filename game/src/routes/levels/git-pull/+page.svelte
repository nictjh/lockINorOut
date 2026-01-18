<script lang="ts">
  import { onMount } from 'svelte';
  import kaboom from 'kaboom';
  import { LEVELS } from "$lib/config/levels";
  import GameInstructions from "$lib/components/GameInstructions.svelte";

  let canvasContainer: HTMLElement;
  let gameCanvas: HTMLCanvasElement;
  let gameFinished = false;
  let selectedBoxName = "";
  let nextLevelPath = "";

  onMount(() => {
    // Select a random level (excluding git-pull which is the current one)
    const otherLevels = LEVELS.filter(l => l.id !== "git-pull");
    const randomLevel = otherLevels[Math.floor(Math.random() * otherLevels.length)];
    nextLevelPath = randomLevel.path;
    const k = kaboom({
      width: 800,
      height: 500,
      canvas: gameCanvas,
      background: [13, 17, 23],
    });

    const boxNames = ["SVN", "mercurial", "Git", "Zip File"];
    let selectedBox: any = null;

    // 1. ADD THE "USER" AT THE BOTTOM
    const user = k.add([
      k.text("👤", { size: 60 }),
      k.pos(k.width() / 2, k.height() - 40),
      k.anchor("center"),
      "user"
    ]);

    boxNames.forEach((name, index) => {
      const xPos = (k.width() / (boxNames.length + 1)) * (index + 1);

      const box = k.add([
        k.rect(80, 80),
        k.pos(xPos, 150),
        k.color(100, 100, 100),
        k.area(),
        k.anchor("center"),
        "repo",
        { name: name }
      ]);

      k.add([
        k.text(name, { size: 14 }),
        k.pos(xPos, 150 - 60),
        k.anchor("center"),
      ]);

      box.onClick(() => {
        selectedBoxName = name;
        selectedBox = box;
        user.pos.x = box.pos.x;
        k.get("repo").forEach(b => b.color = b.name === name ? new k.Color(145, 71, 255) : new k.Color(100, 100, 100));
      });
    });

    // 2. REALISTIC ROPE DRAWING
    k.onDraw(() => {
      if (selectedBox) {
        const start = selectedBox.pos;
        const end = user.pos;

        k.drawLine({
          p1: start,
          p2: end,
          width: 8,
          color: k.rgb(139, 69, 19),
        });

        const distance = start.dist(end);
        for (let i = 0; i < distance; i += 15) {
          const ratio = i / distance;
          const p = start.lerp(end, ratio);
          k.drawRect({
            pos: p,
            width: 8,
            height: 2,
            angle: 45,
            color: k.rgb(0, 0, 0),
            anchor: "center"
          });
        }
      }
    });

    // 3. PULLING LOGIC
    k.onKeyPress("down", () => {
      if (gameFinished || !selectedBox) return;

      selectedBox.pos.y += 10; // Way more clicks needed now!
      k.shake(4);

      user.scale = k.vec2(1.2, 0.8);
      k.wait(0.1, () => user.scale = k.vec2(1));

      if (selectedBox.name === "Git" && selectedBox.pos.y > k.height() - 100) {
        gameFinished = true;
        showWinEffect(k);
      } else if (selectedBox.name !== "Git" && selectedBox.pos.y > k.height() - 100) {
        k.shake(15);
        selectedBox.pos.y = 150;
        alert("The internet refuses to pull this non-Git garbage.");
      }
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
    
    <div class="p-4 bg-gray-900 text-green-400 font-mono text-lg border-b border-gray-800 flex justify-between items-center">
      <span>$ git pull {selectedBoxName}</span>
      {#if !selectedBoxName}
        <span class="animate-pulse text-yellow-500">Select a box to begin...</span>
      {/if}
    </div>

    <div bind:this={canvasContainer} class="canvas-wrapper relative">
      <GameInstructions
        title="Git Pull"
        instructions={[
          "Click the 'Git' box to select the repo.",
          "Spam the DOWN ARROW key to pull.",
          "Pull hard enough, but select the right repo!"
        ]}
        onStart={() => {}}
      />
      <canvas bind:this={gameCanvas}></canvas>
    </div>

    {#if gameFinished}
      <div class="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div class="bg-gray-900 p-8 rounded-2xl border-2 border-purple-500 text-center shadow-2xl">
          <h1 class="text-3xl font-bold text-purple-400 mb-2">Git Pull</h1>
          <p class="text-white italic mb-6 opacity-80 text-lg">
            "The physical act of pulling a purple box until the internet breaks."
          </p>
          <a
            href={nextLevelPath}
            class="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition-all transform hover:scale-110"
          >
            Next Level →
          </a>
        </div>
      </div>
    {/if}
  </div>
</main>
