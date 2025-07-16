import { defineConfig, UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { etaPlugin } from './src/plugins/eta-plugin.ts';

const config: Record<string, UserConfig> = {
    'demo': {
        root: 'src/demo',
        base: './',
        plugins: [
            etaPlugin({
                styles: [
                    './demo.css'
                ],
                scripts: [
                    './demo.js'
                ],
                isDev: false,
            })
        ],
        build: {
            outDir: '../../docs/demo',
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'src/demo/index.eta'),
                    demo: resolve(__dirname, 'src/demo/demo.ts'),
                },
                output: {
                    entryFileNames: '[name].js',
                    assetFileNames: '[name][extname]',
                    format: 'es',
                    sourcemap: false,
                },
            },
            copyPublicDir: false,
        },
    },
    'lib': {
        plugins: [
            dts({ 
                insertTypesEntry: true,
                exclude: [
                    'src/demo/**/*',
                    'src/plugins/**/*',
                    'src/__tests__/**/*',
                    'src/**/*.test.ts',
                    'src/**/*.spec.ts'
                ],
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
    },
    'default': {
        root: 'src/demo',
        base: './',
        plugins: [
            etaPlugin({
                styles: [],
                scripts: ['./demo.ts'],
                isDev: true,
            })
        ],
        build: {
            rollupOptions: {
                input: {
                    demo: resolve(__dirname, 'src/demo/demo.ts'),
                },
            },
        },
        server: {
            port: 3000,
            open: true,
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
            },
        },
    },
};

export default defineConfig(({ mode }) => {
    if (Object.keys(config).includes(mode))
        return config[mode];

    return config['default'];
});
