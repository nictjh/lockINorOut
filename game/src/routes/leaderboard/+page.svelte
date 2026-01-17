<script lang="ts">
  // Leaderboard of people who wasted the most time on this stupid game
  const leaderboard = [
    { rank: 1, name: "TimewasterPro", timewasted: "4h 32m", attempts: 127 },
    { rank: 2, name: "Procrastinator", timewasted: "3h 45m", attempts: 98 },
    { rank: 3, name: "NoLifeGamer", timewasted: "3h 12m", attempts: 89 },
    { rank: 4, name: "ClickAddict", timewasted: "2h 58m", attempts: 76 },
    { rank: 5, name: "GitConfused", timewasted: "2h 31m", attempts: 64 },
  ];
</script>

<main class="min-h-screen w-full bg-[#05070a] p-8">
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-12 text-center">
      <h1 class="text-4xl font-bold text-purple-400 mb-2">🏆 Leaderboard</h1>
      <p class="text-gray-400">Official Ranking of People Who Wasted Time on This Game</p>
      <p class="text-xs text-gray-500 mt-2 italic">...and their completely wrong understanding of CS terms</p>
    </div>

    <!-- Leaderboard Table -->
    <div class="bg-gray-900 border-2 border-gray-700 rounded-xl overflow-hidden shadow-2xl">
      <div class="grid grid-cols-4 gap-4 p-6 bg-gray-800 border-b border-gray-700 font-mono font-bold text-purple-400">
        <div>Rank</div>
        <div>Player</div>
        <div class="text-right">Time Wasted</div>
        <div class="text-right">Attempts</div>
      </div>

      {#each leaderboard as entry (entry.rank)}
        <div class="grid grid-cols-4 gap-4 p-6 border-b border-gray-800 hover:bg-gray-800/50 transition items-center font-mono text-sm">
          <div class="text-purple-400 font-bold text-lg">#{entry.rank}</div>
          <div class="text-white">{entry.name}</div>
          <div class="text-right text-red-400 font-bold">{entry.timewasted}</div>
          <div class="text-right text-orange-400">{entry.attempts}x</div>
        </div>
      {/each}
    </div>

    <!-- Stats -->
    <div class="mt-8 p-6 bg-gray-900 border-2 border-gray-700 rounded-xl text-center">
      <p class="text-gray-300 font-mono mb-2">Total Collective Time Wasted: <span class="text-red-400 font-bold">19h 58m</span></p>
      <p class="text-xs text-gray-500 italic">That's the amount of time people could have spent learning ACTUAL CS concepts! 😅</p>
    </div>

    <!-- Action Buttons -->
    <div class="mt-12 flex gap-4 justify-center">
      <a
        href="/"
        class="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition-all transform hover:scale-110"
      >
        Waste More Time
      </a>
      <a
        href="/levels"
        class="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-bold transition-all transform hover:scale-110"
      >
        All Wrong Terms
      </a>
    </div>
  </div>
</main>

<style>
  :global(body) {
    background: #05070a;
  }
</style>
