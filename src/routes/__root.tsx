import { Outlet, createRootRouteWithContext } from '@tanstack/solid-router'
import TanStackQueryProvider from '../integrations/tanstack-query/provider.tsx'

import Header from '../components/Header'

export const Route = createRootRouteWithContext()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <TanStackQueryProvider>
        <Header />

        <Outlet />
      </TanStackQueryProvider>
    </>
  )
}
