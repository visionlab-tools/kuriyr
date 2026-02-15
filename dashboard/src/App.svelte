<script lang="ts">
  import LogDetail from './lib/LogDetail.svelte'
  import LogList from './lib/LogList.svelte'

  let selectedLogId = $state<number | null>(null)

  function handleHashChange() {
    const hash = window.location.hash
    const match = hash.match(/^#\/logs\/(\d+)$/)
    selectedLogId = match ? parseInt(match[1], 10) : null
  }

  $effect(() => {
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  })

  function selectLog(id: number) {
    window.location.hash = `#/logs/${id}`
  }

  function goBack() {
    window.location.hash = '#/'
  }
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-5xl mx-auto px-6 py-4">
      <h1 class="text-xl font-bold text-gray-900">
        <a href="#/" class="hover:text-indigo-600">Kuriyr</a>
      </h1>
      <p class="text-sm text-gray-500">Email monitoring dashboard</p>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-6 py-8">
    {#if selectedLogId}
      <LogDetail logId={selectedLogId} onBack={goBack} />
    {:else}
      <LogList onSelect={selectLog} />
    {/if}
  </main>
</div>
