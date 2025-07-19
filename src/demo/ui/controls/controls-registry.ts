/**
 * Control types and specifications for dynamic UI generation.
 */

import { controls as perlinControls } from './perlin-noise-control';
import { controls as rendererControls } from './renderer-control';
import { PerlinNoisePattern } from '../../../patterns/perlin-noise-pattern';

export interface ControlSpec {
    id: string;
    min?: number;
    max?: number;
    step?: number;
    label: string;
    description?: string;
    value: string | number | boolean;
    category: 'renderer' | 'pattern';
    options?: Array<{ value: string | number | boolean; label: string }>;
    type: 'number' | 'text' | 'color' | 'select' | 'range' | 'checkbox' | 'textarea';
}

export interface PatternControlConfig {
    label: string;
    controls: ControlSpec[];
}

export interface RendererControlConfig {
    label: string;
    controls: ControlSpec[];
}

/**
 * Registry of all control configurations for different patterns and renderer options.
 */
export class ControlRegistry {
    private static readonly _RENDERER_CONTROLS: RendererControlConfig = rendererControls;

    private static readonly _PATTERN_CONTROLS: Record<string, PatternControlConfig> = {
        [PerlinNoisePattern.ID]: perlinControls,
    };

    /**
     * Get renderer controls configuration.
     */
    public static getRendererControls(): RendererControlConfig {
        return this._RENDERER_CONTROLS;
    }

    /**
     * Get controls configuration for a specific pattern.
     */
    public static getPatternControls(patternType: string): PatternControlConfig | null {
        return this._PATTERN_CONTROLS[patternType] || null;
    }

    /**
     * Get all available pattern types.
     */
    public static getAvailablePatterns(): Array<{ value: string; label: string }> {
        return Object.entries(this._PATTERN_CONTROLS).map(([key, config]) => ({
            value: key,
            label: config.label,
        }));
    }
}
