<script lang="ts">
  // Track which card is expanded by its title (or use an ID)
  let expandedItem = null;

  const toggleExpand = (title) => {
    expandedItem = expandedItem === title ? null : title;
  };

  const feedItems = [
    {
      type: 'Newsletter',
      title: 'The Pragmatic Engineer',
      desc: 'How Big Tech handles migrations.',
      // Extended the summary so you can test the scroll
      summary: 'Large-scale migrations are never just about code. This issue explores the social engineering required to move 1,000+ engineers to a new framework without losing velocity. We also deep-dive into the "Migration Tax" and how to justify technical debt payments to non-technical stakeholders while maintaining a shipping culture.',
      meta: 'New Issue',
      color: 'from-orange-600',
      logo: 'N',
      cta: 'Read Full Issue'
    },
    {
      type: 'GitHub',
      title: 'microsoft/fluentui',
      desc: 'A set of MS focused UI components for building web apps.',
      meta: '⭐ 16.4k stars',
      color: 'from-blue-600',
      logo: 'G',
      cta: 'View Repository'
    },
    {
      type: 'LinkedIn',
      title: 'The Future of AI Context',
      desc: 'Why 1M+ context windows are the new RAM for developers.',
      meta: 'Shared by 400+ people',
      color: 'from-purple-600',
      logo: 'in',
      cta: 'View Post'
    }
  ];
</script>

<main class="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-[#05070a] scroll-smooth">

  {#each feedItems as item}
    <section class="h-screen w-full snap-start flex items-center justify-center p-4 md:p-8">

      <div class="relative w-full max-w-xl h-[85vh] bg-gradient-to-b {item.color} via-slate-900 to-[#05070a] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col p-8 md:p-10 transition-all duration-500">

        <div class="flex justify-between items-start mb-6 transition-opacity {expandedItem === item.title ? 'opacity-30' : 'opacity-100'}">
          <div class="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
            {item.type}
          </div>
          <span class="text-5xl font-black text-white/20 select-none tracking-tighter">{item.logo}</span>
        </div>

        <div class="flex-grow flex flex-col justify-start overflow-hidden">
          <h2 class="font-bold text-white mb-4 leading-tight tracking-tight transition-all duration-500 {expandedItem === item.title ? 'text-2xl opacity-60' : 'text-4xl md:text-5xl'}">
            {item.title}
          </h2>

          {#if expandedItem !== item.title}
            <p class="text-xl text-white/90 font-medium mb-6">
              {item.desc}
            </p>
          {/if}

          {#if item.type === 'Newsletter' && item.summary}
            <div class="relative border-t border-white/10 transition-all duration-500 {expandedItem === item.title ? 'h-full overflow-y-auto pt-4' : 'pt-6 h-auto'}">
              <p class="text-gray-400 leading-relaxed text-base md:text-lg">
                {#if expandedItem === item.title}
                  {item.summary}
                {:else}
                  {item.summary.slice(0, 100)}<span class="text-white/40 italic ml-1">...</span>
                {/if}
              </p>
            </div>
          {/if}

          {#if item.type !== 'Newsletter'}
            <div class="mt-4 w-full h-32 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center italic text-white/20">
              Preview visual for {item.type}
            </div>
          {/if}
        </div>

        <div class="flex items-center justify-between pt-6 border-t border-white/10 mt-auto">
          <div class="flex flex-col">
            <span class="text-xs text-gray-500 uppercase tracking-tighter">Engagement</span>
            <span class="text-sm text-gray-300 font-semibold">{item.meta}</span>
          </div>

          <button
            on:click={() => item.type === 'Newsletter' ? toggleExpand(item.title) : window.open('#')}
            class="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {expandedItem === item.title ? 'Close' : item.cta}
          </button>
        </div>

      </div>
    </section>
  {/each}

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