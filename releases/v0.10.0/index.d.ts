/**
 * ASCIIGround - a library for creating ASCII backgrounds.
 */
export interface ASCIIGroundOptions {
    /** Animation pattern type. */
    pattern: 'perlin' | 'wave' | 'rain' | 'static' | 'japan-rain';
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
    /** Direction of animation, if supported by the pattern. */
    direction?: 'left' | 'right' | 'up' | 'down';
    /** Horizontal wave amplitude (for wave pattern). */
    amplitudeX?: number;
    /** Vertical wave amplitude (for wave pattern). */
    amplitudeY?: number;
    /** Frequency of wave pattern. */
    frequency?: number;
    /** Perlin noise scale factor. */
    noiseScale?: number;
    /** Rain density (for rain/japan-rain patterns), 0-1. */
    rainDensity?: number;
    /** Rain direction (for rain pattern). */
    rainDirection?: 'vertical' | 'diagonal-left' | 'diagonal-right';
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
    private japanRainDrops;
    private rainDropDensity;
    get isAnimating(): boolean;
    constructor(canvas: HTMLCanvasElement, options: ASCIIGroundOptions);
    private setupCanvas;
    private getNoiseFunction;
    private initJapanRain;
    private updateJapanRainDrops;
    private renderJapanRain;
    private render;
    start(): void;
    stop(): void;
    updateOptions(newOptions: Partial<ASCIIGroundOptions>): void;
    resize(width: number, height: number): void;
}
/**
 * Utility function to create an ASCII background that fills the entire page.
 */
export declare function createFullPageBackground(options: ASCIIGroundOptions): ASCIIGround;
export default ASCIIGround;
