<script lang="ts">
  import { fetchLogs, type LogEntry } from './api.js'

  interface Props {
    onSelect: (id: number) => void
  }

  let { onSelect }: Props = $props()

  let logs = $state<LogEntry[]>([])
  let page = $state(1)
  let totalPages = $state(1)
  let filterTemplate = $state('')
  let filterStatus = $state('')
  let loading = $state(true)

  async function load() {
    loading = true
    const result = await fetchLogs({
      page,
      template: filterTemplate || undefined,
      status: filterStatus || undefined,
    })
    logs = result.data
    totalPages = result.pagination.totalPages
    loading = false
  }

  $effect(() => {
    // Re-fetch when filters or page change
    void [page, filterTemplate, filterStatus]
    load()
  })

  function prevPage() {
    if (page > 1) page--
  }

  function nextPage() {
    if (page < totalPages) page++
  }
</script>

<div class="space-y-4">
  <div class="flex gap-3">
    <input
      type="text"
      placeholder="Filter by template..."
      class="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
      bind:value={filterTemplate}
      oninput={() => (page = 1)}
    />
    <select
      class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      bind:value={filterStatus}
      onchange={() => (page = 1)}
    >
      <option value="">All statuses</option>
      <option value="sent">Sent</option>
      <option value="error">Error</option>
    </select>
  </div>

  {#if loading}
    <p class="text-gray-500 text-center py-8">Loading...</p>
  {:else if logs.length === 0}
    <p class="text-gray-500 text-center py-8">No logs found</p>
  {:else}
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600 text-left">
          <tr>
            <th class="px-4 py-3">ID</th>
            <th class="px-4 py-3">Template</th>
            <th class="px-4 py-3">Recipient</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Sent at</th>
          </tr>
        </thead>
        <tbody>
          {#each logs as log}
            <tr
              class="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              onclick={() => onSelect(log.id)}
            >
              <td class="px-4 py-3 text-gray-500">{log.id}</td>
              <td class="px-4 py-3 font-medium">{log.template}</td>
              <td class="px-4 py-3">{log.recipient}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium {log.status === 'sent'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'}"
                >
                  {log.status}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500">{log.sent_at}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between text-sm text-gray-600">
      <button
        class="px-3 py-1.5 border rounded-lg disabled:opacity-40 cursor-pointer"
        disabled={page <= 1}
        onclick={prevPage}
      >
        Previous
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        class="px-3 py-1.5 border rounded-lg disabled:opacity-40 cursor-pointer"
        disabled={page >= totalPages}
        onclick={nextPage}
      >
        Next
      </button>
    </div>
  {/if}
</div>
