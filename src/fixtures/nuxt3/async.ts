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
