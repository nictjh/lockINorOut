<script lang="ts">
  import { onMount } from 'svelte';
  import kaboom from 'kaboom';
  import { LEVELS } from "$lib/config/levels";

  let canvasContainer: HTMLElement;
  let gameCanvas: HTMLCanvasElement;
  let gameFinished = false;
  let nextLevelPath = "";

  onMount(() => {
    // Select a random level (excluding computer-vision which is the current one)
    const otherLevels = LEVELS.filter(l => l.id !== "computer-vision");
    const randomLevel = otherLevels[Math.floor(Math.random() * otherLevels.length)];
    nextLevelPath = randomLevel.path;

    const k = kaboom({
      width: 800,
      height: 500,
      canvas: gameCanvas,
      background: [20, 20, 30],
    });

    // 1. Load Assets
    k.loadSprite("laptop", "/assets/laptop.png");
    k.loadSprite("spectacles", "/assets/spectacles.png");
    k.loadSprite("default", "/assets/default.png");
    k.loadSprite("mouse", "/assets/mouse.png");
    k.loadSprite("webcam", "/assets/webcam.png");
    k.loadSprite("vrhead", "/assets/vrhead.png");
    k.loadSprite("finalLook", "/assets/spectaclesFinal.png");

    // 2. The Laptop Base
    const laptop = k.add([
      k.sprite("laptop"),
      k.pos(k.center()),
      k.anchor("center"),
      k.scale(0.8),
    ]);

    // 3. The HIDDEN Moustache Look (Final Look)
    // We add this as a child of laptop so it stays perfectly aligned
    const moustacheFace = laptop.add([
      k.sprite("finalLook"),
      k.pos(0, 0), // Center of the laptop
      k.anchor("center"),
      k.opacity(0), // START INVISIBLE
    ]);

    const webcam = laptop.add([
      k.circle(10),
      k.pos(0, -175),
      k.opacity(0), // Hide the target circle
      k.area(),
      k.anchor("center"),
      "target"
    ]);

    // 4. Menu Items (Stacked at center - users dig for spectacles)
    const itemsData = [
      { name: "Spectacles", sprite: "spectacles", isCorrect: true },
      { name: "Mouse", sprite: "mouse", isCorrect: false },
      { name: "VR Headset", sprite: "vrhead", isCorrect: false },
      { name: "Default", sprite: "default", isCorrect: false },
      { name: "Webcam", sprite: "webcam", isCorrect: false },
    ];

    const stackX = 400; // Center of screen
    const stackY = 380; // Bottom area
    const stackOffset = 8; // Slight offset for each stacked item

    itemsData.forEach((item, i) => {
      const obj = k.add([
        k.sprite(item.sprite),
        k.pos(stackX + (i * stackOffset), stackY + (i * stackOffset)),
        k.scale(item.sprite === "default" ? 0.2 : 0.6),
        k.z(i), // Higher z-index = drawn on top and clickable first
        k.area(),
        k.anchor("center"),
        "draggable",
        { isCorrect: item.isCorrect }
      ]);
    });

    // 5. Reveal Logic
    let curDrag: any = null;

    k.onMousePress(() => {
      // Get all draggable items sorted by z-index (highest first = top visually)
      const draggables = k.get("draggable").sort((a, b) => (b.z || 0) - (a.z || 0));
      const clicked = draggables.filter(o => o.isHovering())[0];
      if (clicked && !gameFinished) curDrag = clicked;
    });

    k.onMouseRelease(() => {
      if (!curDrag) return;

      if (curDrag.isCorrect && curDrag.isOverlapping(webcam)) {
        // Correct Item Dropped!
        curDrag.hidden = true; // Hide the spectacles being held

        // SLOW REVEAL: Fade in the moustache over 1.5 seconds
        k.tween(0, 1, 1.5, (val) => moustacheFace.opacity = val, k.easings.easeInQuad);

        // Return all items to stack position
        const stackX = 400;
        const stackY = 380;
        const stackOffset = 8;
        k.get("draggable").forEach((obj, i) => {
          obj.pos = k.vec2(stackX + (i * stackOffset), stackY + (i * stackOffset));
        });

        // Wait for fade to finish, then show Svelte UI
        k.wait(2, () => {
          gameFinished = true;
        });
      } else {
        // Wrong item: shake feedback
        k.shake(8);
      }
      curDrag = null;
    });

    k.onMouseMove(() => {
      if (curDrag) curDrag.pos = k.toWorld(k.mousePos());
    });
  });
</script>

<main class="min-h-screen w-full bg-[#05070a] flex items-center justify-center p-4">
  <div class="relative w-[800px] h-[600px] border-4 border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-2xl bg-gray-900">

    <div class="p-4 bg-gray-900 text-blue-400 font-mono text-lg border-b border-gray-800">
      <span>$ What is computer vision?</span>
    </div>

    <div bind:this={canvasContainer} class="flex-grow">
      <canvas bind:this={gameCanvas}></canvas>
    </div>

    {#if gameFinished}
      <div class="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div class="bg-gray-900 p-8 rounded-2xl border-2 border-blue-500 text-center shadow-2xl">
          <h1 class="text-3xl font-bold text-blue-400 mb-2">Computer Vision</h1>
          <p class="text-white italic mb-6 opacity-80 text-lg">
            "The advanced AI process of giving your laptop prescription lenses so it can finally read your code."
          </p>
          <a
            href={nextLevelPath}
            class="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all transform hover:scale-110"
          >
            Next Level →
          </a>
        </div>
      </div>
    {/if}
  </div>
</main>