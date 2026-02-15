<script lang="ts">
  interface Props {
    html: string
  }

  let { html }: Props = $props()

  function writeToIframe(node: HTMLIFrameElement, content: string) {
    const doc = node.contentDocument
    if (doc) {
      doc.open()
      doc.write(content)
      doc.close()
    }

    return {
      update(newContent: string) {
        const d = node.contentDocument
        if (d) {
          d.open()
          d.write(newContent)
          d.close()
        }
      },
    }
  }
</script>

<iframe
  title="Email Preview"
  class="w-full h-[500px] border border-gray-200 rounded-lg bg-white"
  use:writeToIframe={html}
></iframe>
