// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';
// ** ADDING vitePreprocess is usually necessary for TypeScript/SCSS etc. **
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // ** ADD Preprocessor **
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter()
        // SvelteKit automatically adds the $lib alias by default,
        // so explicitly adding it here is usually not required unless
        // you need to override something.
        // alias: {
        //     '$lib': 'src/lib',
        //     '$lib/*': 'src/lib/*'
        // }
    }
};

export default config;