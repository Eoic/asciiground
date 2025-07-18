import type { Pattern } from '../../patterns/pattern';
import type { ASCIIRenderer, ASCIIRendererOptions } from '../../rendering/ascii-renderer';
import { PerlinNoisePattern } from '../../patterns/perlin-noise-pattern';

type ControlValue = string | number | boolean | string[];
type ControlChangeCallback = (value: ControlValue) => void;

/**
 * Proxy wrapper that manages pattern instances and connects them with UI controls.
 * Provides real-time updates and pattern switching capabilities.
 */
export class PatternProxy {
    private renderer: ASCIIRenderer;
    private currentPattern: Pattern | null = null;
    private currentPatternType: string = '';
    private listeners: Map<string, ControlChangeCallback[]> = new Map();

    constructor(renderer: ASCIIRenderer) {
        this.renderer = renderer;
        this.currentPattern = renderer.getPattern();
    }

    /**
     * Switch to a new pattern type and create a fresh instance.
     */
    public switchPattern(patternType: string, initialOptions: Record<string, ControlValue> = {}): void {
        if (this.currentPatternType === patternType) return;

        let newPattern: Pattern;

        // Create pattern based on type
        switch (patternType) {
            case 'perlin':
                newPattern = this.createPerlinPattern(initialOptions);
                break;
            case 'static':
                newPattern = this.createStaticPattern(initialOptions);
                break;
            case 'wave':
                newPattern = this.createWavePattern(initialOptions);
                break;
            case 'rain':
                newPattern = this.createRainPattern(initialOptions);
                break;
            case 'japan-rain':
                newPattern = this.createJapanRainPattern(initialOptions);
                break;
            default:
                console.warn(`Unknown pattern type: ${patternType}`);
                return;
        }

        // Switch renderer to new pattern
        this.renderer.setPattern(newPattern);
        this.currentPattern = newPattern;
        this.currentPatternType = patternType;

        console.log(`Switched to pattern: ${patternType}`);
    }

    /**
     * Update a specific property of the current pattern.
     */
    public updatePatternProperty(propertyName: string, value: ControlValue): void {
        if (!this.currentPattern) return;

        const currentOptions: Record<string, any> = { ...this.currentPattern.options };
        
        // Handle special cases for property transformation
        switch (propertyName) {
            case 'characters':
                currentOptions[propertyName] = Array.isArray(value) ? value : String(value).split('');
                break;
            default:
                // Use bracket notation for dynamic property access
                currentOptions[propertyName] = value;
        }

        // Create new pattern instance with updated options
        this.recreatePatternWithOptions(currentOptions);
    }

    /**
     * Update renderer options in real-time.
     */
    public updateRendererProperty(propertyName: string, value: ControlValue): void {
        const rendererOptions: Partial<ASCIIRendererOptions> = {};
        
        switch (propertyName) {
            case 'fontSize':
            case 'color':
            case 'backgroundColor':
            case 'fontFamily':
                rendererOptions[propertyName] = value as any;
                break;
            case 'animationEnabled':
                if (value) 
                    this.renderer.startAnimation();
                else 
                    this.renderer.stopAnimation();
                
                return;
        }

        if (Object.keys(rendererOptions).length > 0) 
            this.renderer.updateOptions(rendererOptions);
        
    }

    /**
     * Handle any control change by routing to appropriate update method.
     */
    public handleControlChange(controlId: string, value: ControlValue): void {
        // Determine if this is a renderer or pattern property
        const rendererProperties = ['fontSize', 'fontFamily', 'color', 'backgroundColor', 'animationEnabled'];
        
        if (controlId === 'pattern') {
            // Pattern type change - switch entirely
            this.switchPattern(String(value));
        } else if (rendererProperties.includes(controlId)) {
            // Renderer property
            this.updateRendererProperty(controlId, value);
        } else {
            // Pattern property
            this.updatePatternProperty(controlId, value);
        }

        // Emit change event to any listeners
        this.emitChange(controlId, value);
    }

    /**
     * Get current pattern options for UI synchronization.
     */
    public getCurrentPatternOptions(): Record<string, ControlValue> {
        if (!this.currentPattern) return {};
        
        const options = this.currentPattern.options;
        const result: Record<string, ControlValue> = {};

        // Convert options to control-friendly format
        Object.entries(options).forEach(([key, value]) => {
            if (key === 'characters' && Array.isArray(value)) 
                result[key] = value.join('');
            else 
                result[key] = value as ControlValue;
            
        });

        return result;
    }

    /**
     * Get current renderer options for UI synchronization.
     */
    public getCurrentRendererOptions(): Record<string, ControlValue> {
        // Since renderer options are private, we'll use known defaults
        // In a real implementation, you might expose these through the renderer
        return {
            fontSize: 36,
            fontFamily: 'monospace',
            color: '#4b18d8',
            backgroundColor: '#0A0321',
            animationEnabled: this.renderer.isAnimating,
        };
    }

    /**
     * Recreate the current pattern with updated options.
     */
    private recreatePatternWithOptions(newOptions: Record<string, any>): void {
        if (!this.currentPatternType) return;

        let newPattern: Pattern;

        switch (this.currentPatternType) {
            case 'perlin':
                newPattern = new PerlinNoisePattern(newOptions);
                break;
            // Add other patterns here as they're implemented
            default:
                console.warn(`Cannot recreate pattern: ${this.currentPatternType}`);
                return;
        }

        this.renderer.setPattern(newPattern);
        this.currentPattern = newPattern;
    }

    /**
     * Create Perlin noise pattern with options.
     */
    private createPerlinPattern(options: Record<string, ControlValue>): Pattern {
        const perlinOptions: any = {
            characters: ['.', '+', '#', '@'],
            animationSpeed: 50,
            frequency: 0.05,
            octaves: 5,
            persistence: 0.5,
            lacunarity: 2.0,
            seed: 42,
            ...options,
        };

        // Ensure characters is an array
        if (typeof perlinOptions.characters === 'string') 
            perlinOptions.characters = perlinOptions.characters.split('');
        

        return new PerlinNoisePattern(perlinOptions);
    }

    /**
     * Create static pattern (placeholder - implement when static pattern class exists).
     */
    private createStaticPattern(options: Record<string, ControlValue>): Pattern {
        // For now, return a Perlin pattern with high frequency as a placeholder
        return this.createPerlinPattern({
            ...options,
            frequency: 10,
            animationSpeed: 100,
        });
    }

    /**
     * Create wave pattern (placeholder - implement when wave pattern class exists).
     */
    private createWavePattern(options: Record<string, ControlValue>): Pattern {
        // For now, return a Perlin pattern as a placeholder
        return this.createPerlinPattern({
            ...options,
            frequency: 0.1,
            persistence: 0.8,
        });
    }

    /**
     * Create rain pattern (placeholder - implement when rain pattern class exists).
     */
    private createRainPattern(options: Record<string, ControlValue>): Pattern {
        // For now, return a Perlin pattern as a placeholder
        return this.createPerlinPattern({
            ...options,
            frequency: 0.2,
            animationSpeed: 10,
        });
    }

    /**
     * Create Japan rain pattern (placeholder - implement when Japan rain pattern class exists).
     */
    private createJapanRainPattern(options: Record<string, ControlValue>): Pattern {
        // For now, return a Perlin pattern as a placeholder
        return this.createPerlinPattern({
            ...options,
            characters: ['ﾊ', 'ﾐ', 'ﾋ', 'ｰ', 'ｳ', 'ｼ', 'ﾅ', 'ﾓ', 'ﾆ', 'ｻ', 'ﾜ', 'ﾂ', 'ｵ', 'ﾘ', 'ｱ', 'ﾎ', 'ﾃ', 'ﾏ', 'ｹ', 'ﾒ', 'ｴ', 'ｶ', 'ｷ', 'ﾑ'],
            animationSpeed: 7,
        });
    }

    /**
     * Add listener for control changes.
     */
    public addListener(controlId: string, callback: ControlChangeCallback): void {
        if (!this.listeners.has(controlId)) 
            this.listeners.set(controlId, []);
        
        this.listeners.get(controlId)!.push(callback);
    }

    /**
     * Remove listener for a specific control.
     */
    public removeListener(controlId: string, callback: ControlChangeCallback): void {
        const listeners = this.listeners.get(controlId);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) 
                listeners.splice(index, 1);
            
        }
    }

    /**
     * Emit change event to listeners.
     */
    private emitChange(controlId: string, value: ControlValue): void {
        const listeners = this.listeners.get(controlId);
        if (listeners) 
            listeners.forEach(callback => callback(value));
        
    }

    /**
     * Get the current pattern type.
     */
    public getCurrentPatternType(): string {
        return this.currentPatternType;
    }

    /**
     * Get the current pattern instance.
     */
    public getCurrentPattern(): Pattern | null {
        return this.currentPattern;
    }

    /**
     * Cleanup method.
     */
    public destroy(): void {
        this.listeners.clear();
        this.currentPattern = null;
    }
}
