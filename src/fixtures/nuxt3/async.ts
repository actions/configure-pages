// https://nuxt.com/docs/api/configuration/nuxt-config
const getAllDynamicRoute = async function () {
  const routes = await (async () => {
    return ['/posts/hello-world', '/posts/hello-again']
  })()
  return routes
}

export default defineNuxtConfig({
  generate: {
    routes: await getAllDynamicRoute()
  }
})
