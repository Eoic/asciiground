import type { RendererControlConfig } from './controls-registry';

export const controls: RendererControlConfig = {
    label: 'Renderer',
    controls: [{
        id: 'fontSize',
        label: 'Font size',
        type: 'number',
        value: 36,
        min: 8,
        max: 72,
        step: 1,
        category: 'renderer',
        description: 'Size of the rendered characters in pixels.',
    }, {
        id: 'fontFamily',
        label: 'Font family',
        type: 'select',
        value: 'monospace',
        options: [
            { value: 'monospace', label: 'Monospace' },
            { value: 'Courier New', label: 'Courier New' },
            { value: 'Consolas', label: 'Consolas' },
            { value: 'Monaco', label: 'Monaco' },
            { value: 'Menlo', label: 'Menlo' }
        ],
        category: 'renderer',
        description: 'Font family used for rendering characters.',
    }, {
        id: 'color',
        label: 'Text color',
        type: 'color',
        value: '#ffffff',
        category: 'renderer',
        description: 'Color of the rendered characters.',
    }, {
        id: 'backgroundColor',
        label: 'Background color',
        type: 'color',
        value: '#313131',
        category: 'renderer',
        description: 'Background color of the canvas.',
    }, {
        id: 'animated',
        label: 'Animated',
        type: 'checkbox',
        value: false,
        category: 'renderer',
        description: 'Enable or disable animation for the renderer.',
    }],
};
