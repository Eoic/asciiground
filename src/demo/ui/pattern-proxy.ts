import { Pattern } from '../../patterns/pattern';
import type { ASCIIRenderer, ASCIIRendererOptions } from '../../rendering/ascii-renderer';
import { PerlinNoisePattern } from '../../patterns/perlin-noise-pattern';

export type ControlValue = string | number | boolean | string[];
export type ControlChangeCallback = (value: ControlValue) => void;
export type PatternConstructor = new (options?: Record<string, unknown>) => Pattern;

/**
 * Proxy wrapper that manages pattern instances and connects them with UI controls.
 * Provides real-time updates and pattern switching capabilities.
 */
export class PatternProxy {
    private _renderer: ASCIIRenderer;
    private _listeners: Map<string, ControlChangeCallback[]> = new Map();
    private _patterns: Record<string, PatternConstructor> = this._createPatternRegistry();

    /**
     * Creates the pattern registry by mapping pattern constructors to their IDs.
     * Add new patterns here to make them available for switching in the UI.
     */
    private _createPatternRegistry(): Record<string, PatternConstructor> {
        const registry = [
            PerlinNoisePattern
        ].reduce((patterns, PatternClass) => ({ ...patterns, [PatternClass.ID]: PatternClass}), {});

        return registry;
    }

    constructor(renderer: ASCIIRenderer) {
        this._renderer = renderer;
    }

    /**
     * Get the current pattern ID.
     */
    public getCurrentPatternId(): string {
        return this._renderer.pattern.id;
    }

    // /**
    //  * Initialize with a default pattern if current pattern is dummy.
    //  */
    // public initializeDefaultPattern(): void {
    //     console.log('Current pattern ID before initialization:', this._renderer.pattern.id);
    //     if (this._renderer.pattern.id === 'dummy') {
    //         const defaultPatternId = 'perlin-noise';
    //         console.log('Switching to default pattern:', defaultPatternId);
    //         this.switchPattern(defaultPatternId);
    //         console.log('Pattern ID after switch:', this._renderer.pattern.id);
    //     } else 
    //         console.log('Pattern is already initialized, no switch needed');
        
    // }

    /**
     * Switch to a new pattern type by creating and setting a new pattern instance.
     */
    public switchPattern(patternId: string): void {
        // console.log('switchPattern called with:', patternId);
        // console.log('Current pattern ID:', this._renderer.pattern.id);
        // console.log('Available patterns:', Object.keys(this._patterns));
        
        if (this._renderer.pattern.id === patternId) {
            console.warn(`Pattern "${patternId}" is already active.`);
            return;
        }

        const PatternConstructor = this._patterns[patternId];

        if (!PatternConstructor) {
            // console.error(`Pattern type "${patternId}" is not supported.`);
            // console.error('Available patterns:', Object.keys(this._patterns));
            throw new Error(`Pattern type "${patternId}" is not supported.`);
        }

        // console.log('Creating new pattern instance for:', patternId);
        this._renderer.pattern = new PatternConstructor();
        // console.log('Pattern switched to:', this._renderer.pattern.id);
    }

    /**
     * Update a specific property of the current pattern.
     */
    public _updatePatternProperty(propertyName: string, value: ControlValue): void {
        let processedValue = value;
        
        // Convert string characters to array for pattern compatibility
        if (propertyName === 'characters' && typeof value === 'string') 
            processedValue = value.split('');
        

        const options: Record<string, unknown> = {
            ...this._renderer.pattern.options,
            [propertyName]: processedValue,
        };

        const patternId = this._renderer.pattern.id;
        const PatternConstructor = this._patterns[patternId];

        if (!PatternConstructor) {
            console.warn(`Cannot update pattern "${patternId}".`);
            return;
        }

        this._renderer.pattern = new PatternConstructor(options);
    }

    /**
     * Update renderer options in real-time.
     */
    public _updateRendererProperty(propertyName: string, value: ControlValue): void {
        const options: ASCIIRendererOptions = {
            ...this._renderer.options,
            [propertyName]: value,
        };

        this._renderer.updateOptions(options);
    }

    /**
     * Handle any control change by routing to appropriate update method.
     */
    public handleControlChange(controlCategory: string, controlId: string, value: ControlValue): void {
        if (controlId === 'pattern') {
            this.switchPattern(String(value));
            return;
        }

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
     * Cleanup method.
     */
    public destroy(): void {
        this._listeners.clear();
    }

    /**
     * Notify all listeners about a control value change.
     */
    private _emitChange(controlId: string, value: ControlValue): void {
        const listeners = this._listeners.get(controlId) || [];
        listeners.forEach(callback => callback(value));
    }
}
