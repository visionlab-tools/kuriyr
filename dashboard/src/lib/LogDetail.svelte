<script lang="ts">
  import { fetchLog, type LogEntry } from './api.js'
  import PreviewPane from './PreviewPane.svelte'

  interface Props {
    logId: number
    onBack: () => void
  }

  let { logId, onBack }: Props = $props()
  let log = $state<LogEntry | null>(null)
  let loading = $state(true)

  $effect(() => {
    loading = true
    fetchLog(logId).then((data) => {
      log = data
      loading = false
    })
  })
</script>

<div>
  <button
    class="mb-4 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
    onclick={onBack}
  >
    &larr; Back to logs
  </button>

  {#if loading}
    <p class="text-gray-500">Loading...</p>
  {:else if log}
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500">Template:</span>
          <span class="font-medium ml-1">{log.template}</span>
        </div>
        <div>
          <span class="text-gray-500">Status:</span>
          <span
            class="ml-1 px-2 py-0.5 rounded-full text-xs font-medium {log.status === 'sent'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'}"
          >
            {log.status}
          </span>
        </div>
        <div>
          <span class="text-gray-500">Recipient:</span>
          <span class="font-medium ml-1">{log.recipient}</span>
        </div>
        <div>
          <span class="text-gray-500">Locale:</span>
          <span class="font-medium ml-1">{log.locale}</span>
        </div>
        <div>
          <span class="text-gray-500">Subject:</span>
          <span class="font-medium ml-1">{log.subject}</span>
        </div>
        <div>
          <span class="text-gray-500">Sent at:</span>
          <span class="font-medium ml-1">{log.sent_at}</span>
        </div>
        {#if log.error}
          <div class="col-span-2">
            <span class="text-gray-500">Error:</span>
            <span class="font-medium ml-1 text-red-600">{log.error}</span>
          </div>
        {/if}
      </div>
    </div>

    <h3 class="text-lg font-semibold mb-3">Email Preview</h3>
    <PreviewPane html={log.html} />
  {/if}
</div>
