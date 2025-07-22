import type { ASCIIRenderer, ASCIIRendererOptions } from '../../rendering/ascii-renderer';
import { ControlsRegistry, type PatternConstructor } from './controls/controls-registry';

export type ControlValue = string | number | boolean | string[];
export type ControlChangeCallback = (value: ControlValue) => void;

/**
 * Proxy wrapper that manages pattern instances and connects them with UI controls.
 * Provides real-time updates and pattern switching capabilities.
 */
export class PatternProxy {
    private _renderer: ASCIIRenderer;
    private _listeners: Map<string, ControlChangeCallback[]> = new Map();

    constructor(renderer: ASCIIRenderer) {
        this._renderer = renderer;
        this._renderer.updateOptions(ControlsRegistry.getRendererOptions());
    }

    /**
     * Get the current pattern ID.
     */
    public getCurrentPatternId(): string {
        return this._renderer.pattern.id;
    }

    /**
     * Switch to a new pattern type by creating and setting a new pattern instance.
     */
    public switchPattern(patternId: string): void {
        if (this._renderer.pattern.id === patternId) {
            console.warn(`Pattern "${patternId}" is already active.`);
            return;
        }

        const [PatternConstructor, defaultOptions] = this._getPattern(patternId);
        this._renderer.pattern = new PatternConstructor(defaultOptions);
        this._renderer.updateOptions(ControlsRegistry.getRendererOptions());
        this._renderer.render();
    }

    /**
     * Update a specific property of the current pattern.
     */
    public _updatePatternProperty(propertyName: string, value: ControlValue): void {
        let processedValue = value;

        if (propertyName === 'characters' && typeof value === 'string') 
            processedValue = value.split('');

        const options: Record<string, unknown> = {
            ...this._renderer.pattern.options,
            [propertyName]: processedValue,
        };

        const patternId = this._renderer.pattern.id;
        const [PatternConstructor, _defaultOptions]  = this._getPattern(patternId);

        if (!PatternConstructor) {
            console.warn(`Cannot update pattern "${patternId}".`);
            return;
        }

        // FIXME: Add proper debouncing, 200ms.
        this._renderer.pattern = new PatternConstructor(options);
        requestAnimationFrame(() => this._renderer.render());
        console.log(`Pattern property "${propertyName}" updated to:`, processedValue);
    }

    /**
     * Update renderer options in real-time.
     */
    public _updateRendererProperty(propertyName: string, value: ControlValue): void {
        const options: ASCIIRendererOptions = {
            ...this._renderer.options,
            [propertyName]: value,
        };

        // FIXME: Add proper debouncing, 200ms.
        this._renderer.updateOptions(options);
        requestAnimationFrame(() => this._renderer.render());
        console.log(`Renderer property "${propertyName}" updated to:`, value);
    }

    /**
     * Handle any control change by routing to appropriate update method.
     */
    public handleControlChange(controlCategory: string, controlId: string, value: ControlValue): void {
        switch (controlCategory) {
            case 'renderer':
                this._updateRendererProperty(controlId, value);
                break;
            case 'pattern':
                this._updatePatternProperty(controlId, value);
                break;
        }

        this._emitChange(controlId, value);
    }

    public getRendererOptions(): Record<string, ControlValue> {
        const options = this._renderer.options;
        const result: Record<string, ControlValue> = {};
        Object.entries(options).forEach(([key, value]) => result[key] = value as ControlValue);

        return result;
    }

    /**
     * Return options of the active pattern for UI synchronization.
     * One could just return the pattern's options directly, but this method
     * allows for future flexibility if we need to transform or filter options.
     */
    public getPatternOptions(): Record<string, ControlValue> {
        const options = this._renderer.pattern.options;
        const result: Record<string, ControlValue> = {};
        Object.entries(options).forEach(([key, value]) => result[key] = value as ControlValue);

        return result;
    }

    /**
     * Get the pattern constructor based on the pattern ID from the registry.
     */
    private _getPattern(patternId: string): [PatternConstructor, Record<string, unknown>] {
        const patternControls = ControlsRegistry.getPatternControls(patternId);
        return [patternControls.pattern, ControlsRegistry.getPatternOptions(patternId)];
    }

    /**
     * Notify all listeners about a control value change.
     */
    private _emitChange(controlId: string, value: ControlValue): void {
        const listeners = this._listeners.get(controlId) || [];
        listeners.forEach(callback => callback(value));
    }
}
