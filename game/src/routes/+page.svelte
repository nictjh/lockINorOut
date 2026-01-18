<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  interface FeedArticle {
    id: string;
    title: string;
    summary: string;
    source?: string;
    url?: string;
    topic?: string;
    timestamp: string;
  }

  interface UserStats {
    streak: number;
    lastReadDate: string | null;
    articlesRead: number;
    totalTimeSpentSeconds: number;
  }

  let expandedItem: string | null = null;
  let feedItems: FeedArticle[] = [];
  let loading = true;
  let error = '';

  // Locking & Transition State
  let showTransition = true;
  let canExit = false;
  let timeLeft = 60; // 60 seconds lock
  let timerInterval: any;

  // Analytics State
  let stats: UserStats = {
    streak: 0,
    lastReadDate: null,
    articlesRead: 0,
    totalTimeSpentSeconds: 0
  };

  let sessionTime = 0;
  let timeTracker: any;

  const toggleExpand = (id: string) => {
    const isExpanding = expandedItem !== id;
    expandedItem = isExpanding ? id : null;

    if (isExpanding) {
      // Track article read
      stats.articlesRead++;
      saveStats();
    }
  };

  const saveStats = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lockin_stats', JSON.stringify(stats));
    }
  };


  // Derived unique topics from feed for the header
  $: activeTopics = [...new Set(feedItems.map(i => i.topic).filter(Boolean))];

  const checkStreak = () => {
    const today = new Date().toDateString();
    
    // If first time or new day
    if (stats.lastReadDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (stats.lastReadDate === yesterday.toDateString()) {
        // Consecutive day
        stats.streak++;
      } else if (stats.lastReadDate !== today) {
        // Broken streak (unless it's the very first read ever, but let's just start at 1)
        // If last read was older than yesterday, reset to 1 (since they are here today)
        stats.streak = 1;
      }
      stats.lastReadDate = today;
      saveStats();
    }
  };

  onMount(async () => {
    // 1. Transition Animation
    setTimeout(() => {
      showTransition = false;
    }, 4000);

    // 2. Locking Timer
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        canExit = true;
        clearInterval(timerInterval);
      }
    }, 1000);

    // 3. Load & Update Stats
    const stored = localStorage.getItem('lockin_stats');
    if (stored) {
      stats = JSON.parse(stored);
    }
    checkStreak();

    // Track time spent in session
    timeTracker = setInterval(() => {
      sessionTime++;
      stats.totalTimeSpentSeconds++;
      if (sessionTime % 5 === 0) saveStats(); // Save every 5s
    }, 1000);

    try {
      const response = await fetch('/api/feed');
      if (!response.ok) throw new Error('Failed to fetch feed');
      
      const data = await response.json();
      feedItems = data.articles || [];
      loading = false;
    } catch (err) {
      console.error('Error loading feed:', err);
      // error = 'Failed to load feed. Please try again.'; // Suppress error for demo/smoothness if preferred, or keep
      error = 'Failed to load feed.';
      loading = false;
    }


  });

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (timeTracker) clearInterval(timeTracker);
    saveStats();
  });
</script>

<main class="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-[#05070a] scroll-smooth relative">

  <!-- Transition Overlay -->
  {#if showTransition}
    <div 
      transition:fade={{ duration: 1000 }}
      class="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center"
    >
      <h1 class="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 animate-pulse">
        While you wait...
      </h1>
      <p 
        in:fly={{ y: 20, duration: 800, delay: 1000 }} 
        class="text-xl text-gray-400 font-light"
      >
        Why not catch up on some things you might have missed?
      </p>
    </div>
  {/if}

  <!-- Streak & Stats Display -->
  <div class="fixed top-8 right-8 z-40 flex flex-col items-end gap-2 pointer-events-none mix-blend-difference">
    <div class="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
      <span class="text-xl">🔥</span>
      <span class="font-bold text-white">{stats.streak} <span class="text-xs font-normal text-white/60">DAY STREAK</span></span>
    </div>
    {#if stats.articlesRead > 0}
      <div class="text-xs text-white/40 font-mono tracking-widest">
        READ: {stats.articlesRead}
      </div>
    {/if}
  </div>

  {#if loading}
    <section class="h-screen w-full snap-start flex items-center justify-center p-4">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-400">Loading your feed...</p>
      </div>
    </section>
  {:else if error}
    <section class="h-screen w-full snap-start flex items-center justify-center p-4">
      <div class="text-center">
        <p class="text-red-400 mb-2">{error}</p>
        <button
          on:click={() => location.reload()}
          class="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
        >
          Retry
        </button>
      </div>
    </section>
  {:else if feedItems.length === 0}
    <section class="h-screen w-full snap-start flex items-center justify-center p-4">
      <div class="text-center">
        <p class="text-gray-400">No articles available yet.</p>
      </div>
    </section>
  {:else}
    {#each feedItems as item (item.id)}
      <section class="h-screen w-full snap-start flex items-center justify-center p-4 md:p-8">
        <div class="relative w-full max-w-xl h-[85vh] bg-gradient-to-b from-purple-600 via-slate-900 to-[#05070a] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col p-8 md:p-10 transition-all duration-500">

          <!-- Header -->
          <div class="flex justify-between items-start mb-6 transition-opacity {expandedItem === item.id ? 'opacity-30' : 'opacity-100'}">
            <div class="flex items-center gap-2">
              <div class="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                {item.source || 'Article'}
              </div>
              {#if item.topic}
                <div class="px-2 py-1 rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-200 uppercase tracking-wider border border-purple-500/30">
                  #{item.topic}
                </div>
              {/if}
            </div>
            <span class="text-5xl font-black text-white/20 select-none tracking-tighter">📰</span>
          </div>

          <!-- Content -->
          <div class="flex-grow flex flex-col justify-start overflow-hidden">
            <h2 class="font-bold text-white mb-4 leading-tight tracking-tight transition-all duration-500 {expandedItem === item.id ? 'text-2xl opacity-60' : 'text-4xl md:text-5xl'}">
              {item.title}
            </h2>

            <!-- Summary -->
            <div class="relative border-t border-white/10 transition-all duration-500 {expandedItem === item.id ? 'h-full overflow-y-auto pt-4' : 'pt-6 h-auto'}">
              <p class="text-gray-400 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                {#if expandedItem === item.id}
                  {item.summary}
                {:else}
                  {item.summary.slice(0, 150)}<span class="text-white/40 italic ml-1">...</span>
                {/if}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-6 border-t border-white/10 mt-auto">
            <div class="flex flex-col">
              <span class="text-xs text-gray-500 uppercase tracking-tighter">Published</span>
              <span class="text-sm text-gray-300 font-semibold">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>

            <button
              on:click={() => toggleExpand(item.id)}
              class="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              {expandedItem === item.id ? 'Close' : 'Read More'}
            </button>
          </div>

        </div>
      </section>
    {/each}
  {/if}

  <!-- Exit Button -->
  <div class="fixed top-8 left-8 z-50">
    {#if canExit}
      <a href="/game" class="group flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:border-white/40 transition-all">
        <span class="group-hover:-translate-x-1 transition-transform">←</span>
        <span class="text-sm font-medium">Exit Feed</span>
      </a>
    {:else}
      <div class="flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-sm border border-white/5 rounded-full text-white/40 cursor-not-allowed">
        <span class="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></span>
        <span class="text-sm font-medium tabular-nums">Locked for {timeLeft}s</span>
      </div>
    {/if}
  </div>
</main>

<style>
  main::-webkit-scrollbar { display: none; }
  main { -ms-overflow-style: none; scrollbar-width: none; }

  /* Smooth scrollbar for the internal summary text */
  div::-webkit-scrollbar { width: 4px; }
  div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>