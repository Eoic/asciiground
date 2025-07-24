export interface PatternOptions {
    characters: string[];
    animationSpeed: number;
}

export const DEFAULT_PATTERN_OPTIONS: PatternOptions = {
    characters: ['█', '▓', '▒', '░', ' '],
    animationSpeed: 1,
};

/**
 * Represents a single character to be rendered at a specific position.
 */
export interface CharacterData {
    x: number;
    y: number;
    char: string;
    color?: string;
    opacity?: number;
    scale?: number;
    rotation?: number;
}

/**
 * Rendering region that may extend beyond the visible area for complex effects.
 */
export interface RenderRegion {
    rows: number;
    columns: number;
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
    charWidth: number;
    charHeight: number;
    charSpacingX: number;
    charSpacingY: number;
    canvasWidth: number;
    canvasHeight: number;
}

/**
 * Context for pattern generation.
 */
export interface PatternContext {
    time: number;
    deltaTime: number;
    animationTime: number;
    mouseX?: number;
    mouseY?: number;
    clicked?: boolean;
    isAnimating?: boolean;
    region: RenderRegion;
}

/**
 * Base class for all pattern generators.
 */
export abstract class Pattern<TOptions extends PatternOptions = PatternOptions> {
    public static readonly ID: string;
    protected _options: TOptions;

    public get id(): string {
        return (this.constructor as typeof Pattern).ID;
    }

    public get options(): TOptions {
        return this._options;
    }

    constructor(options: Partial<TOptions> = {}) {
        this._options = { ...DEFAULT_PATTERN_OPTIONS, ...options } as TOptions;
    }

    /**
     * Update pattern options without recreating the pattern instance.
     * Override this method if your pattern has expensive initialization that should be preserved.
     * @param newOptions - partial options to update
     */
    public updateOptions(newOptions: Partial<TOptions>): void {
        this._options = { ...this._options, ...newOptions };
    }

    /**
     * Generate characters for the given context.
     * May render outside visible area for effects like blur or particle systems.
     * @param context - current rendering context with time, mouse position, etc.
     * @param previousOutput - previously rendered characters, if any.
     * @returns Array of characters to render with their positions and properties
     */
    public abstract generate(context: PatternContext): CharacterData[];

    /**
     * Called when the pattern is initialized or resized.
     * Use this to set up any internal state or precompute values.
     * @param region - the rendering region including visible area and padding.
     */
    public initialize(_region: RenderRegion): void {}

    /**
     * Called when the pattern is destroyed.
     * Use this to clean up resources, cancel timers, etc.
     */
    public destroy(): void {}

    /**
     * Update pattern state between frames.
     * Called before `generate()` on each frame.
     * @param context - current rendering context.
     */
    public abstract update(_context: PatternContext): Pattern

    /**
     * Handle mouse interactions with the pattern.
     * Override to implement custom mouse effects.
     * @param x - mouse X position relative to canvas.
     * @param y - mouse Y position relative to canvas.
     * @param clicked - Whether mouse was clicked this frame.
     */
    public onMouseInteraction(_x: number, _y: number, _clicked: boolean): void {}

    /**
     * Get the recommended render padding for this pattern.
     * Patterns that need to render outside visible area should override this.
     * @returns Number of extra characters to render outside visible area.
     */
    public getRecommendedPadding(): number {
        return 0;
    }
}
