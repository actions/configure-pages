// Default Pages configuration for SvelteKit
import adapter from '@sveltejs/adapter-auto'

export default {
  kit: {
    paths: { base: '/docs' },
    adapter: adapter()
  }
}
