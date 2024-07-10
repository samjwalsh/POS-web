import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';


export default defineConfig({
    plugins: [sveltekit()],
    build: {
        rollupOptions: {
            external: ['@node-rs/argon2']
        },
    },
    optimizeDeps: {
        exclude: ['@node-rs/argon2', '@node-rs/bcrypt']
    },
});
