<script lang="ts">
  import { onMount } from 'svelte';
  import kaboom from 'kaboom';
  import { LEVELS } from "$lib/config/levels";
  import GameInstructions from "$lib/components/GameInstructions.svelte";
  import { slide } from 'svelte/transition';

  let gameCanvas: HTMLCanvasElement;
  let gameFinished = false;
  let showResultModal = false;
  let nextLevelPath = "";
  let showHint1 = false;
  let showHint2 = false;

  const targetWord = "MACHINELEARNING";
  const rows = 5;
  const cols = 15;
  let currentRow = 0;
  let currentGuess = "";
  let guesses = Array(rows).fill("");

  let k: any;

  onMount(() => {
    const otherLevels = LEVELS.filter(l => l.id !== "machine-learning");
    const randomLevel = otherLevels[Math.floor(Math.random() * otherLevels.length)];
    nextLevelPath = randomLevel?.path || "/";

    k = kaboom({
      width: 800,
      height: 120, // Smaller header canvas
      canvas: gameCanvas,
      background: [13, 17, 23],
    });

    k.add([
      k.text("Wordle of the DAY?...", { size: 20, font: "monospace" }),
      k.pos(k.center()),
      k.anchor("center"),
      k.color(147, 51, 234)
    ]);
  });

  function getColor(letter: string, index: number, rowIdx: number) {
    if (rowIdx >= currentRow) return "border-gray-700 text-white";
    const char = letter.toUpperCase();
    if (targetWord[index] === char) return "bg-green-600 border-green-600 text-white";
    if (targetWord.includes(char)) return "bg-yellow-600 border-yellow-600 text-white";
    return "bg-gray-800 border-gray-800 text-gray-500";
  }

  function handleInput(e: KeyboardEvent) {
    if (gameFinished || showResultModal) return;
    if (e.key === "Enter") {
      if (currentGuess.length === cols) submitGuess();
    } else if (e.key === "Backspace") {
      currentGuess = currentGuess.slice(0, -1);
    } else if (currentGuess.length < cols && /^[a-zA-Z]$/.test(e.key)) {
      currentGuess += e.key.toUpperCase();
    }
    guesses[currentRow] = currentGuess;
  }

  function submitGuess() {
    if (currentGuess === targetWord) {
      gameFinished = true;
      k.shake(5);
      setTimeout(() => showResultModal = true, 800);
    } else {
      currentRow++;
      currentGuess = "";
      
      // Hint Logic
      if (currentRow >= 1) showHint1 = true;
      if (currentRow >= 3) showHint2 = true;
      
      if (currentRow === rows) {
        location.reload();
      }
    }
  }
</script>

<svelte:window on:keydown={handleInput} />

<main class="min-h-screen w-full bg-[#05070a] flex items-center justify-center p-4 text-xs relative">
  <div class="absolute top-4 left-4 z-50">
    <a
      href="/game"
      class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all text-sm"
    >
      ← Back (Read)
    </a>
  </div>
  <div class="relative w-[800px] border-4 border-gray-700 rounded-xl overflow-hidden flex flex-col shadow-2xl bg-gray-900 transition-all duration-500 ease-in-out">
    
    <div class="p-4 bg-gray-950 text-purple-400 font-mono text-sm border-b border-gray-800 flex justify-between">
      <span>$ WHY IS IT SO LONG</span>
      <span class="opacity-50 tracking-tighter">EPOCH: {currentRow + 1}/5</span>
    </div>

    <div class="h-[120px] border-b border-gray-800 bg-[#0d1117]">
      <canvas bind:this={gameCanvas}></canvas>
    </div>

    <!-- Hints Section: Side by Side -->
    {#if showHint1 || showHint2}
      <div class="border-b border-gray-800 p-6 bg-gray-950 flex justify-center items-center gap-6">
        {#if showHint1}
          <div class="flex flex-col items-center">
            <p class="text-purple-400 font-mono mb-3 text-xs uppercase tracking-widest">💡 Dataset Visual A</p>
            <img src="/assets/teacher.png" alt="Teacher" class="h-48 w-auto rounded-lg border-2 border-purple-900/50 shadow-xl transition-all duration-500" />
          </div>
        {/if}

        {#if showHint2}
          <div class="flex flex-col items-center">
            <p class="text-purple-400 font-mono mb-3 text-xs uppercase tracking-widest">💡 Dataset Visual B</p>
            <img src="/assets/class.png" alt="Class" class="h-48 w-auto rounded-lg border-2 border-purple-900/50 shadow-xl transition-all duration-500" />
          </div>
        {/if}
      </div>
    {/if}

    <div class="flex-grow flex flex-col items-center justify-center gap-2 p-8 bg-[#0d1117]">
      {#each Array(rows) as _, r}
        <div class="flex gap-1">
          {#each Array(cols) as _, c}
            <!-- Add visual spacing -->
            {#if c === 7}
              <div class="w-2"></div>
            {/if}
            <div class="w-10 h-10 border flex items-center justify-center font-bold text-lg transition-all duration-500
              {getColor(guesses[r][c] || "", c, r)}">
              {guesses[r][c] || ""}
            </div>
          {/each}
        </div>
      {/each}
      
      <GameInstructions
        title="Wordle"
        instructions={[
          "Guess the hidden 15-letter term.",
          "It's like Wordle, but much longer.",
          "Hints will appear if you struggle (Epochs)."
        ]}
        onStart={() => {
          // Focus window to ensure keyboard capture works immediately
          window.focus();
        }}
      />
    </div>

    {#if showResultModal}
      <div class="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-50 p-6">
        <div class="bg-gray-900 border-2 border-purple-500 p-8 rounded-2xl max-w-md text-center shadow-2xl">
          <h1 class="text-3xl font-bold text-purple-400 mb-2">Machine Learning</h1>
          <p class="text-white italic mb-6 opacity-90 text-sm">
            "Your model has successfully realized that Machine Learning is just a classroom for hardware."
          </p>
          <a href={nextLevelPath} class="inline-block w-full py-3 bg-purple-600 text-white rounded-lg font-bold text-center">
            Deploy Next Epoch
          </a>
        </div>
      </div>
    {/if}
  </div>
</main>