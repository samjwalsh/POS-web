import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { isoImport } from 'vite-plugin-iso-import';


export default defineConfig({
    plugins: [sveltekit(), isoImport()],
    build: {
        rollupOptions: {
            external: ['@node-rs/argon2']
        },
    },

    optimizeDeps: {
        exclude: ['@node-rs/argon2', '@node-rs/bcrypt']
    },
});
