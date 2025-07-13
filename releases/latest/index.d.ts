/**
 * ASCIIGround - a library for creating ASCII backgrounds.
 */
export interface ASCIIGroundOptions {
    /** Animation pattern type. */
    pattern: 'perlin' | 'wave' | 'rain' | 'static';
    /** ASCII characters to use for rendering (from lightest to darkest). */
    characters: string[];
    /** Animation speed multiplier. */
    speed: number;
    /** Whether the background is animated. */
    animated?: boolean;
    /** Font size in pixels. */
    fontSize?: number;
    /** Font family. */
    fontFamily?: string;
    /** Text color. */
    color?: string;
    /** Background color. */
    backgroundColor?: string;
}
export interface NoiseFunction {
    (x: number, y: number, time: number): number;
}
/**
 * Main ASCIIGround class for creating backgrounds.
 */
export declare class ASCIIGround {
    private canvas;
    private ctx;
    private options;
    private animationId;
    private startTime;
    private perlin;
    private cols;
    private rows;
    private charWidth;
    private charHeight;
    /**
     * Check if the animation is currently running.
     */
    get isAnimating(): boolean;
    constructor(canvas: HTMLCanvasElement, options: ASCIIGroundOptions);
    private setupCanvas;
    private getNoiseFunction;
    private render;
    /**
     * Start the animation.
     */
    start(): void;
    /**
     * Stop the animation.
     */
    stop(): void;
    /**
     * Update animation options.
     */
    updateOptions(newOptions: Partial<ASCIIGroundOptions>): void;
    /**
     * Resize the canvas and recalculate grid.
     */
    resize(width: number, height: number): void;
}
/**
 * Utility function to create an ASCII background that fills the entire page.
 */
export declare function createFullPageBackground(options: ASCIIGroundOptions): ASCIIGround;
export default ASCIIGround;
