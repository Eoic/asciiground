/**
 * Control types and specifications for dynamic UI generation.
 */

export interface ControlSpec {
    id: string;
    label: string;
    type: 'number' | 'text' | 'color' | 'select' | 'range' | 'checkbox' | 'textarea';
    value: string | number | boolean;
    min?: number;
    max?: number;
    step?: number;
    options?: Array<{ value: string | number | boolean; label: string }>;
    description?: string;
    category?: 'renderer' | 'pattern';
}

export interface PatternControlConfig {
    name: string;
    controls: ControlSpec[];
}

export interface RendererControlConfig {
    controls: ControlSpec[];
}

/**
 * Registry of all control configurations for different patterns and renderer options.
 */
export class ControlRegistry {
    private static readonly RENDERER_CONTROLS: RendererControlConfig = {
        controls: [
            {
                id: 'fontSize',
                label: 'Font Size',
                type: 'number',
                value: 36,
                min: 8,
                max: 72,
                step: 1,
                category: 'renderer',
                description: 'Size of the rendered characters in pixels.',
            },
            {
                id: 'fontFamily',
                label: 'Font Family',
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
            },
            {
                id: 'color',
                label: 'Text Color',
                type: 'color',
                value: '#4b18d8',
                category: 'renderer',
                description: 'Color of the rendered characters.',
            },
            {
                id: 'backgroundColor',
                label: 'Background Color',
                type: 'color',
                value: '#0A0321',
                category: 'renderer',
                description: 'Background color of the canvas.',
            }
        ],
    };

    private static readonly PATTERN_CONTROLS: Record<string, PatternControlConfig> = {
        'perlin': {
            name: 'Perlin Noise',
            controls: [
                {
                    id: 'characters',
                    label: 'Characters',
                    type: 'text',
                    value: '.+#@',
                    category: 'pattern',
                    description: 'Characters used for rendering (from lightest to darkest).',
                },
                {
                    id: 'animationSpeed',
                    label: 'Animation Speed',
                    type: 'range',
                    value: 50,
                    min: 0.1,
                    max: 200,
                    step: 0.1,
                    category: 'pattern',
                    description: 'Speed of the animation.',
                },
                {
                    id: 'frequency',
                    label: 'Frequency',
                    type: 'range',
                    value: 0.05,
                    min: 0.001,
                    max: 0.5,
                    step: 0.001,
                    category: 'pattern',
                    description: 'Base frequency of the Perlin noise. Higher values create more rapid changes.',
                },
                {
                    id: 'octaves',
                    label: 'Octaves',
                    type: 'range',
                    value: 5,
                    min: 1,
                    max: 8,
                    step: 1,
                    category: 'pattern',
                    description: 'Number of noise layers. More octaves add detail.',
                },
                {
                    id: 'persistence',
                    label: 'Persistence',
                    type: 'range',
                    value: 0.5,
                    min: 0.1,
                    max: 1.0,
                    step: 0.01,
                    category: 'pattern',
                    description: 'Controls amplitude of each octave. Lower values reduce higher octave influence.',
                },
                {
                    id: 'lacunarity',
                    label: 'Lacunarity',
                    type: 'range',
                    value: 2.0,
                    min: 1.0,
                    max: 4.0,
                    step: 0.1,
                    category: 'pattern',
                    description: 'Controls frequency of each octave.',
                },
                {
                    id: 'seed',
                    label: 'Seed',
                    type: 'number',
                    value: 42,
                    min: 0,
                    max: 99999,
                    step: 1,
                    category: 'pattern',
                    description: 'Seed for random number generation. Same seed produces same pattern.',
                }
            ],
        },
        'static': {
            name: 'Static Noise',
            controls: [
                {
                    id: 'characters',
                    label: 'Characters',
                    type: 'textarea',
                    value: ' .*#',
                    category: 'pattern',
                    description: 'Characters used for rendering.',
                },
                {
                    id: 'animationSpeed',
                    label: 'Animation Speed',
                    type: 'range',
                    value: 10,
                    min: 0.1,
                    max: 100,
                    step: 0.1,
                    category: 'pattern',
                    description: 'Speed of the static animation.',
                }
            ],
        },
        'wave': {
            name: 'Wave Pattern',
            controls: [
                {
                    id: 'characters',
                    label: 'Characters',
                    type: 'textarea',
                    value: '~-=#',
                    category: 'pattern',
                    description: 'Characters used for rendering wave pattern.',
                },
                {
                    id: 'animationSpeed',
                    label: 'Animation Speed',
                    type: 'range',
                    value: 2,
                    min: 0.1,
                    max: 50,
                    step: 0.1,
                    category: 'pattern',
                    description: 'Speed of wave animation.',
                },
                {
                    id: 'amplitudeX',
                    label: 'Amplitude X',
                    type: 'range',
                    value: 1,
                    min: 0.1,
                    max: 5,
                    step: 0.1,
                    category: 'pattern',
                    description: 'Horizontal wave amplitude.',
                },
                {
                    id: 'amplitudeY',
                    label: 'Amplitude Y',
                    type: 'range',
                    value: 1,
                    min: 0.1,
                    max: 5,
                    step: 0.1,
                    category: 'pattern',
                    description: 'Vertical wave amplitude.',
                },
                {
                    id: 'frequency',
                    label: 'Frequency',
                    type: 'range',
                    value: 1,
                    min: 0.1,
                    max: 10,
                    step: 0.1,
                    category: 'pattern',
                    description: 'Wave frequency.',
                },
                {
                    id: 'direction',
                    label: 'Direction',
                    type: 'select',
                    value: 'down',
                    options: [
                        { value: 'down', label: 'Down' },
                        { value: 'up', label: 'Up' },
                        { value: 'left', label: 'Left' },
                        { value: 'right', label: 'Right' }
                    ],
                    category: 'pattern',
                    description: 'Direction of wave movement.',
                }
            ],
        },
        'rain': {
            name: 'Rain Pattern',
            controls: [
                {
                    id: 'characters',
                    label: 'Characters',
                    type: 'textarea',
                    value: '|!1:',
                    category: 'pattern',
                    description: 'Characters used for rain drops.',
                },
                {
                    id: 'animationSpeed',
                    label: 'Animation Speed',
                    type: 'range',
                    value: 5,
                    min: 0.1,
                    max: 50,
                    step: 0.1,
                    category: 'pattern',
                    description: 'Speed of rain animation.',
                },
                {
                    id: 'rainDensity',
                    label: 'Rain Density',
                    type: 'range',
                    value: 0.9,
                    min: 0,
                    max: 1,
                    step: 0.01,
                    category: 'pattern',
                    description: 'Density of rain drops (0-1).',
                },
                {
                    id: 'rainDirection',
                    label: 'Rain Direction',
                    type: 'select',
                    value: 'vertical',
                    options: [
                        { value: 'vertical', label: 'Vertical' },
                        { value: 'diagonal-left', label: 'Diagonal Left' },
                        { value: 'diagonal-right', label: 'Diagonal Right' }
                    ],
                    category: 'pattern',
                    description: 'Direction of rain fall.',
                }
            ],
        },
        'japan-rain': {
            name: 'Japanese Matrix Rain',
            controls: [
                {
                    id: 'animationSpeed',
                    label: 'Animation Speed',
                    type: 'range',
                    value: 7,
                    min: 0.1,
                    max: 50,
                    step: 0.1,
                    category: 'pattern',
                    description: 'Speed of Japanese character rain.',
                },
                {
                    id: 'rainDensity',
                    label: 'Rain Density',
                    type: 'range',
                    value: 0.85,
                    min: 0,
                    max: 1,
                    step: 0.01,
                    category: 'pattern',
                    description: 'Density of Japanese character drops.',
                }
            ],
        },
    };

    /**
     * Get control configuration for a specific pattern.
     */
    public static getPatternControls(patternType: string): PatternControlConfig | null {
        return this.PATTERN_CONTROLS[patternType] || null;
    }

    /**
     * Get renderer control configuration.
     */
    public static getRendererControls(): RendererControlConfig {
        return this.RENDERER_CONTROLS;
    }

    /**
     * Get all available pattern types.
     */
    public static getAvailablePatterns(): Array<{ value: string; label: string }> {
        return Object.entries(this.PATTERN_CONTROLS).map(([key, config]) => ({
            value: key,
            label: config.name,
        }));
    }

    /**
     * Get control specification by ID from any category.
     */
    public static getControlSpec(patternType: string, controlId: string): ControlSpec | null {
        // Check renderer controls first
        const rendererControl = this.RENDERER_CONTROLS.controls.find(c => c.id === controlId);
        if (rendererControl) return rendererControl;

        // Check pattern controls
        const patternConfig = this.PATTERN_CONTROLS[patternType];
        if (patternConfig) {
            const patternControl = patternConfig.controls.find(c => c.id === controlId);
            if (patternControl) return patternControl;
        }

        return null;
    }
}
