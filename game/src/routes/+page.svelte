<script lang="ts">
  import { onMount } from 'svelte';

  interface FeedArticle {
    id: string;
    title: string;
    summary: string;
    source?: string;
    url?: string;
    timestamp: string;
  }

  let expandedItem: string | null = null;
  let feedItems: FeedArticle[] = [];
  let loading = true;
  let error = '';

  const toggleExpand = (id: string) => {
    expandedItem = expandedItem === id ? null : id;
  };

  onMount(async () => {
    try {
      const response = await fetch('/api/feed');
      if (!response.ok) throw new Error('Failed to fetch feed');
      
      const data = await response.json();
      feedItems = data.articles || [];
      loading = false;
    } catch (err) {
      console.error('Error loading feed:', err);
      error = 'Failed to load feed. Please try again.';
      loading = false;
    }
  });
</script>

<main class="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-[#05070a] scroll-smooth">

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
            <div class="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
              {item.source || 'Article'}
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
    <a href="/game" class="group flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:border-white/40 transition-all">
      <span class="group-hover:-translate-x-1 transition-transform">←</span>
      <span class="text-sm font-medium">Exit Feed</span>
    </a>
  </div>
</main>

<style>
  main::-webkit-scrollbar { display: none; }
  main { -ms-overflow-style: none; scrollbar-width: none; }

  /* Smooth scrollbar for the internal summary text */
  div::-webkit-scrollbar { width: 4px; }
  div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>