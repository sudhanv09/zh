import { createRouter as createTanstackRouter } from '@tanstack/solid-router'

import { routeTree } from './routeTree.gen'

import './styles.css'

export const createRouter = () => {
  const router = createTanstackRouter({
    routeTree,
    scrollRestoration: true,
  })
  return router
}

const router = createRouter()

declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}
