import { Eta } from 'eta';
import type { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface EtaPluginOptions {
    styles: string[];
    scripts: string[];
}

export function etaPlugin(options: EtaPluginOptions): Plugin {
    return {
        name: 'eta-template',
        enforce: 'pre' as const,

        resolveId(id: string) {
            if (id.endsWith('.eta'))
                return id;
        },

        load(id: string) {
            if (id.endsWith('.eta')) {
                const template = readFileSync(id, 'utf-8');

                return {
                    code: `export default ${JSON.stringify(template)};`,
                    map: null,
                };
            }
        },

        generateBundle(_, bundle) {
            const mainChunk = Object.values(bundle).find(chunk => 
                chunk.type === 'chunk' && chunk.isEntry
            );

            if (mainChunk && mainChunk.type === 'chunk') {
                const template = readFileSync(resolve(__dirname, '../demo/index.eta'), 'utf-8');

                const eta = new Eta({
                    autoEscape: false,
                    useWith: true,
                });
                
                const rendered = eta.renderString(template, {
                    styles: options.styles,
                    scripts: options.scripts,
                });

                delete bundle[mainChunk.fileName];

                this.emitFile({
                    type: 'asset',
                    fileName: 'index.html',
                    source: rendered,
                });
            }
        },
    };
}
