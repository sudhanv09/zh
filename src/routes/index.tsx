import { createFileRoute } from '@tanstack/solid-router'
export const Route = createFileRoute('/')({
  component: IndexComponent,
})

function IndexComponent() {
  return (
    <div class="text-center">
      <header class="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <a
          class="text-[#61dafb] hover:underline"
          href="https://solidjs.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
        <a
          class="text-[#61dafb] hover:underline"
          href="https://tanstack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn TanStack
        </a>
      </header>
    </div>
  )
}
