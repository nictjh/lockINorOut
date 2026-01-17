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

  let resetGame: () => void;

  onMount(() => {
    // Select a random level (excluding backend-developer which is the current one)
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

    // Array of random texts to choose from
    const textList = [
      "I ONLY WORK ON THE BACKEND BECAUSE FRONTEND IS A SOCIAL CONSTRUCT",
      "BACKEND DEVELOPERS WRITE PRODUCTION CODE IN PRODUCTION",
      "DATABASES ARE MY LOVE LANGUAGE",
      "WHY FIX BUGS WHEN YOU CAN JUST RESTART THE SERVER",
      "FULL STACK DEVELOPER MEANS I CAN BREAK BOTH ENDS",
      "DEVOPS ENGINEERS MAKE BACKEND DEVELOPERS CRY",
      "MICROSERVICES BECAUSE ONE MONOLITH WAS TOO SIMPLE",
      "CLOUD NATIVE OR GO HOME",
    ];

    const targetText = textList[Math.floor(Math.random() * textList.length)];

    // Scoped variables so we can reset them
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

    // Define the reset logic
    resetGame = () => {
      userInput = "";
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

      k.loop(1, () => {
        if (timer > 0 && timerActive) {
          timer--;
          timerLabel.text = `TIME REMAINING: ${timer}s`;
        } else if (timer <= 0 && timerActive) {
          finishGame();
        }
      });
    }

    k.onCharInput((ch) => {
      if (!isRotated || gameFinished) return;
      if (userInput.length === 0) {
        uiLabel.text = "TYPING... (DON'T LOOK AT THE KEYBOARD)";
        uiLabel.color = k.rgb(50, 50, 50);
      }
      userInput += ch;
      console.log(`Typed: "${ch}" | Total input: "${userInput}" | Length: ${userInput.length}/${targetText.length}`);
      k.shake(1);

      // Finish game when user completes the target text
      if (userInput.length >= targetText.length) {
        console.log("Game finished - user completed typing");
        finishGame();
      }
    });

    function finishGame() {
      timerActive = false;
      gameFinished = true;

      let correctChars = 0;
      const normalizedTarget = targetText.toUpperCase();
      const normalizedInput = userInput.toUpperCase();

      for (let i = 0; i < normalizedTarget.length; i++) {
        if (normalizedInput[i] === normalizedTarget[i]) correctChars++;
      }

      accuracyResult = Math.floor((correctChars / normalizedTarget.length) * 100);
      isSuccess = accuracyResult >= 60;
      showResultModal = true;
    }
  });
</script>

<main class="min-h-screen w-full bg-[#05070a] flex items-center justify-center p-4">
  <div class="relative w-[800px] h-[600px] border-4 border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-gray-900">
    
    <div class="p-4 bg-gray-950 text-green-500 font-mono text-sm border-b border-gray-800 flex justify-between">
      <span>$ ssh admin@production-backend</span>
      <span class="opacity-50">v1.0.4-stable</span>
    </div>

    <div class="relative flex-grow bg-[#0d1117]">
      <canvas bind:this={gameCanvas} class="w-full h-full"></canvas>
    </div>

    {#if showResultModal}
      <div class="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-50 p-6">
        <div class="bg-gray-900 border-2 {isSuccess ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]'} p-8 rounded-2xl max-w-md text-center">

          <h1 class="text-3xl font-bold mb-2 {isSuccess ? 'text-green-400' : 'text-red-500'}">
            {isSuccess ? 'Backend Verified' : 'Critical Failure'}
          </h1>

          <div class="text-xs font-mono mb-4 bg-black p-2 rounded {isSuccess ? 'text-green-700' : 'text-red-700'}">
            Accuracy: {accuracyResult}% | Status: {isSuccess ? 'STABLE' : 'OUT OF SYNC'}
          </div>

          <p class="text-white italic mb-8 opacity-90 text-sm">
            {isSuccess
              ? '"The true backend master works in total darkness, guided only by the click-clack of the keys."'
              : '"Frontend logic detected in the brain. Your backend connection has been severed due to typo-induced shame."'}
          </p>

          {#if isSuccess}
            <a
              href={nextLevelPath}
              class="inline-block w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all active:scale-95 text-center"
            >
              Deploy to Production (Next Level)
            </a>
          {:else}
            <button 
              on:click={resetGame}
              class="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all active:scale-95"
            >
              Recalibrate Finger Sensors (Retry)
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</main>