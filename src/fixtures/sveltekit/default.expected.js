import adapter from '@sveltejs/adapter-auto'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    paths: { base: '/docs' },
    adapter: adapter()
  }
}

export default config
