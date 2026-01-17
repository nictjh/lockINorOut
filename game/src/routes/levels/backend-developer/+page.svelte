<script lang="ts">
  import { onMount } from 'svelte';
  import kaboom from 'kaboom';
  import { LEVELS } from "$lib/config/levels";

  let gameCanvas: HTMLCanvasElement;
  let gameFinished = false;
  let showResultModal = false;
  let isSuccess = false;
  let accuracyResult = 0;
  let nextLevelPath = "";
  let finalUserInput = ""; // To show the "shameful" result in the modal
  let backendDevImage: string | null = null;

  let resetGame: () => void;

  onMount(() => {
    const otherLevels = LEVELS.filter(l => l.id !== "backend-developer");
    const randomLevel = otherLevels[Math.floor(Math.random() * otherLevels.length)];
    nextLevelPath = randomLevel.path;

    const k = kaboom({
      width: 800,
      height: 500,
      canvas: gameCanvas,
      background: [10, 10, 15],
    });

    k.loadSprite("laptop_front", "/assets/laptopFront.png");
    k.loadSprite("laptop_back", "/assets/laptopBack.png");
    k.loadSprite("backendDev", "/assets/backendDev.png");

    const textList = [
      "I ONLY WORK ON THE BACKEND BECAUSE FRONTEND IS A SOCIAL CONSTRUCT",
      "BACKEND DEVELOPERS WRITE PRODUCTION CODE IN PRODUCTION",
      "DATABASES ARE MY LOVE LANGUAGE",
      "WHY FIX BUGS WHEN YOU CAN JUST RESTART THE SERVER",
      "CLOUD NATIVE OR GO HOME",
    ];

    let targetText = textList[Math.floor(Math.random() * textList.length)];
    let userInput = "";
    let isRotated = false;
    let timer = 15;
    let timerActive = false;

    const laptop = k.add([
      k.sprite("laptop_front"),
      k.pos(k.center()),
      k.anchor("center"),
      k.scale(0.7, 0.7),
      k.area(),
    ]);

    const uiLabel = k.add([
      k.text("CLICK AND DRAG TO ROTATE TO THE BACKEND", { size: 16, font: "monospace" }),
      k.pos(k.width() / 2, 80),
      k.anchor("center"),
      k.color(0, 255, 0),
    ]);

    const timerLabel = k.add([
      k.text("", { size: 24, font: "monospace" }),
      k.pos(k.width() / 2, 420),
      k.anchor("center"),
      k.color(255, 0, 0),
    ]);

    // --- GHOST LETTER EFFECT ---
    function spawnGhostLetter(char: string) {
      const ghost = k.add([
        k.text(char, { size: 28, font: "monospace" }),
        k.pos(k.width() / 2 + k.rand(-150, 150), k.height() / 2),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.opacity(0),
        "ghost-letter"
      ]);
    }

    resetGame = () => {
      userInput = "";
      finalUserInput = "";
      isRotated = false;
      timer = 15;
      timerActive = false;
      gameFinished = false;
      showResultModal = false;
      isSuccess = false;
      
      laptop.use(k.sprite("laptop_front"));
      laptop.scale.x = 0.7;
      uiLabel.text = "CLICK AND DRAG TO ROTATE TO THE BACKEND";
      uiLabel.color = k.rgb(0, 255, 0);
      timerLabel.text = "";
      k.get("ghost-letter").forEach(g => g.destroy());
    };

    let isDragging = false;
    k.onMouseDown(() => { isDragging = true; });
    k.onMouseRelease(() => { isDragging = false; });

    k.onMouseMove(() => {
      if (isDragging && !isRotated) {
        laptop.scale.x -= Math.abs(k.mouseDeltaPos().x) * 0.005;
        if (laptop.scale.x <= 0) {
          laptop.use(k.sprite("laptop_back"));
          isRotated = true;
          laptop.scale.x = 0.7;
          startTypingChallenge();
        }
      }
    });

    function startTypingChallenge() {
      uiLabel.text = `TYPE BLIND NOW:\n"${targetText}"`;
      uiLabel.color = k.rgb(255, 255, 255);
      timerActive = true;

      const timerInterval = setInterval(() => {
        if (timer > 0 && timerActive) {
          timer--;
          timerLabel.text = `TIME REMAINING: ${timer}s`;
        } else if (timer <= 0 && timerActive) {
          clearInterval(timerInterval);
          finishGame();
        }
      }, 1000); // Update every 1000ms (1 second)
    }

    k.onCharInput((ch) => {
      if (!isRotated || gameFinished) return;
      if (userInput.length === 0) {
        uiLabel.text = "TYPING... (DON'T LOOK AT THE KEYBOARD)";
        uiLabel.color = k.rgb(50, 50, 50);
      }
      userInput += ch;
      spawnGhostLetter(ch); // Create ghost object (invisible)
      k.shake(2);
    });

    function finishGame() {
      timerActive = false;
      gameFinished = true;
      finalUserInput = userInput;

      let correctChars = 0;
      const normalizedTarget = targetText.toUpperCase();
      const normalizedInput = userInput.toUpperCase();

      for (let i = 0; i < normalizedTarget.length; i++) {
        if (normalizedInput[i] === normalizedTarget[i]) correctChars++;
      }

      accuracyResult = Math.floor((correctChars / normalizedTarget.length) * 100);
      isSuccess = accuracyResult >= 60;

      // If failed, make all remaining ghosts fly away quickly
      if (!isSuccess) {
        // 1. PHYSICAL FAILURE: Shake the whole screen violently
        k.shake(20);

        // 2. GHOST BURST: Shoot them away
        k.get("ghost-letter").forEach(g => {
          // Make ghosts visible and give them explosive velocity
          g.opacity = 0.8;
          const angle = k.rand(0, 360);
          const speed = k.rand(400, 800);
          g.onUpdate(() => {
            g.move(k.vec2(Math.cos(angle), Math.sin(angle)).scale(speed));
          });
          // Fade out as they fly away
          k.tween(0.8, 0, 1.2, (v) => g.opacity = v, k.easings.easeOutQuad);
        });

        // 3. DELAYED UI: Wait 1 second for the chaos to be seen
        k.wait(1, () => {
          gameFinished = true;
          showResultModal = true;
        });
      } else {
        // If success, show modal immediately or after a shorter "win" pause
        gameFinished = true;
        showResultModal = true;
      }
    }
  });
</script>

<main class="min-h-screen w-full bg-[#05070a] flex items-center justify-center p-4">
  <div class="relative w-[800px] h-[600px] border-4 border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-gray-900">

    <div class="p-4 bg-gray-950 text-green-500 font-mono text-sm border-b border-gray-800 flex justify-between">
      <span>$ Backend Developer?</span>
      <span class="opacity-50">v1.0.4-stable</span>
    </div>

    <div class="relative flex-grow bg-[#0d1117]">
      <canvas bind:this={gameCanvas} class="w-full h-full"></canvas>
    </div>

    {#if showResultModal}
      <div class="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-50 p-5">
        <div class="bg-gray-900 border-2 {isSuccess ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]'} p-6 rounded-2xl max-w-sm text-center max-h-[85vh] overflow-y-auto">

          <h1 class="text-3xl font-bold mb-2 {isSuccess ? 'text-green-400' : 'text-red-500'}">
            {isSuccess ? 'Backend Verified' : 'Critical Failure'}
          </h1>

          {#if isSuccess}
            <div class="mb-4 flex justify-center">
              <img src="/assets/backendDev.png" alt="Backend Developer" class="h-48 w-auto rounded" />
            </div>
          {/if}

          <p class="text-white italic mb-4 opacity-90 text-sm font-bold text-green-400">
            {isSuccess
              ? '"Backend Developer (noun) An elite class of software engineer who has transcended the need for visual interfaces. By facing the literal back of the laptop, they communicate directly with the hardware through the medium of plastic casing and copper heat pipes."'
              : '"Frontend logic detected in the brain. Your backend connection has been severed due to typo-induced shame."'}
          </p>

          <div class="text-left mt-4 mb-4 space-y-2">
            <div class="bg-black/60 p-2 rounded border {isSuccess ? 'border-green-900' : 'border-red-900'}">
              <p class="text-[10px] text-gray-500 uppercase font-bold">Your Raw Output:</p>
              <p class="text-sm font-mono {isSuccess ? 'text-green-500' : 'text-red-400'} break-words">
                {finalUserInput || "[NO DATA RECEIVED]"}
              </p>
            </div>
          </div>

          <div class="text-xs font-mono mb-4 bg-black p-2 rounded {isSuccess ? 'text-green-700' : 'text-red-700'}">
            Accuracy: {accuracyResult}% | Status: {isSuccess ? 'STABLE' : 'OUT OF SYNC'}
          </div>

          {#if isSuccess}
            <a href={nextLevelPath} class="inline-block w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-center">
              Deploy to Production (Next Level)
            </a>
          {:else}
            <button on:click={resetGame} class="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold">
              Recalibrate Finger Sensors (Retry)
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</main>