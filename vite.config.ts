import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
        })
    ],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'ASCIIGround',
            formats: ['es', 'umd'],
            fileName: (format) => `asciiground.${format}.js`,
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {},
                exports: 'named',
            },
        },
    },
});
