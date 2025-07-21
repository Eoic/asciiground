import { DummyPattern } from '../patterns/dummy-pattern';
import { Pattern, type PatternContext, type RenderRegion } from '../patterns/pattern';
import { type Renderer, createRenderer } from './renderer';

export interface ASCIIRendererOptions {
    color: string;
    fontSize: number;
    fontFamily: string;
    backgroundColor: string;
    renderPadding?: number;
    rendererType?: '2D' | 'WebGL';
    enableMouseInteraction?: boolean;
}

const DEFAULT_OPTIONS: ASCIIRendererOptions = {
    color: '#3e3e80ff',
    fontSize: 32,
    fontFamily: 'monospace',
    backgroundColor: '#181818ff',
    renderPadding: 0,
    rendererType: '2D',
    enableMouseInteraction: false,
};

/**
 * Main ASCII renderer that coordinates pattern generation with rendering.
 * Supports both 2D canvas and WebGL rendering with automatic fallback.
 */
export class ASCIIRenderer {
    private _canvas: HTMLCanvasElement;
    private _renderer: Renderer;
    private _pattern: Pattern;
    private _region: RenderRegion;
    private _options: ASCIIRendererOptions;
    private _lastTime: number = 0;
    private _animationId: number | null = null;
    private _isAnimating: boolean = false;
    private _mouseX: number = 0;
    private _mouseY: number = 0;
    private _mouseClicked: boolean = false;

    public get options(): ASCIIRendererOptions {
        return this._options;
    }

    public get pattern(): Pattern {
        return this._pattern;
    }

    public set pattern(pattern: Pattern) {
        this._pattern.destroy();
        this._pattern = pattern;
        this._pattern.initialize(this._region);
    }

    public get isAnimating(): boolean {
        return this._isAnimating;
    }

    /**
     * Create a new ASCII renderer.
     * @param canvas - the canvas element to render to.
     * @param pattern - the pattern generator to use.
     * @param options - rendering options.
     */
    constructor(canvas: HTMLCanvasElement, pattern?: Pattern, options: Partial<ASCIIRendererOptions> = {}) {
        this._canvas = canvas;
        this._pattern = pattern || new DummyPattern();

        this._options = {
            ...DEFAULT_OPTIONS,
            ...options,
            renderPadding: this._pattern.getRecommendedPadding() || DEFAULT_OPTIONS.renderPadding,
        };

        this._renderer = createRenderer(this._options.rendererType || '2D');
        this._region = this._calculateRegion();
        this._setupRenderer();

        if (this._options.enableMouseInteraction) 
            this._setupMouseEvents();
    }

    private _calculateRegion(): RenderRegion {
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d')!;
        tempContext.font = `${this._options.fontSize}px ${this._options.fontFamily}`;

        const metrics = tempContext.measureText('M');
        const charWidth = metrics.width;
        const charHeight = this._options.fontSize;
        const cols = Math.floor(this._canvas.width / charWidth);
        const rows = Math.floor(this._canvas.height / charHeight);
        const padding = this._options.renderPadding || 0;
        
        return {
            startColumn: -padding,
            endColumn: cols + padding,
            startRow: -padding,
            endRow: rows + padding,
            columns: cols,
            rows,
            charWidth,
            charHeight,
            canvasWidth: this._canvas.width,
            canvasHeight: this._canvas.height,
        };
    }

    /**
     * Initialize the renderer with the canvas and options.
     * This sets up the rendering context and prepares for rendering.
     */
    private _setupRenderer(): void {
        this._renderer.initialize(this._canvas, this._options);
        this._pattern.initialize(this._region);
    }

    /**
     * Handle mouse move events to update mouse position.
     * @param event Mouse event to handle.
     */
    private _mouseMoveHandler = (event: MouseEvent) => {
        const rect = this._canvas.getBoundingClientRect();
        this._mouseX = event.clientX - rect.left;
        this._mouseY = event.clientY - rect.top;
    };

    /**
     * Handle mouse click events to update clicked state.
     * This can be used by patterns to respond to user input.
     */
    private _mouseClickHandler = () => {
        this._mouseClicked = true;
    };
    
    /**
     * Setup mouse event listeners for interaction.
     * This allows patterns to respond to mouse movements and clicks.
     */
    private _setupMouseEvents(): void {
        this._canvas.addEventListener('mousemove', this._mouseMoveHandler);
        this._canvas.addEventListener('click', this._mouseClickHandler);
    }

    /**
     * Render a single frame.
     */
    public render(time: number = performance.now()): void {
        const deltaTime = time - this._lastTime;
        this._lastTime = time;

        const context: PatternContext = {
            time: time / 1000,
            deltaTime: deltaTime / 1000,
            region: this._region,
            mouseX: this._mouseX,
            mouseY: this._mouseY,
            clicked: this._mouseClicked,
        };

        this._mouseClicked = false;
        this._pattern.update(context);

        const characters = this._pattern.generate(context);
        this._renderer.clear(this._options.backgroundColor);
        this._renderer.render(characters, this._region);
    }

    /**
     * Start animation loop.
     */
    public startAnimation(): void {
        if (this._isAnimating)
            return;

        this._isAnimating = true;
        this._lastTime = performance.now();

        const animate = (time: number) => {
            if (!this._isAnimating)
                return;

            this.render(time);
            this._animationId = requestAnimationFrame(animate);
        };

        this._animationId = requestAnimationFrame(animate);
    }

    /**
     * Stop animation loop.
     */
    public stopAnimation(): void {
        this._isAnimating = false;

        if (this._animationId !== null) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }
    }

    /**
     * Update rendering options.
     */
    public updateOptions(options: Partial<ASCIIRendererOptions>): void {
        this._options = { ...this._options, ...options };
        this._region = this._calculateRegion();
        this._pattern.initialize(this._region);
        this._renderer.options = this._options;
    }

    /**
     * Resize the canvas and recalculate layout.
     */
    public resize(width: number, height: number): void {
        this._canvas.width = width;
        this._canvas.height = height;
        this._region = this._calculateRegion();
        this._renderer.resize(width, height);
        this._pattern.initialize(this._region);

        if (!this._isAnimating) 
            this.render();
    }

    /**
     * Cleanup resources and stop animation.
     */
    public destroy(): void {
        this.stopAnimation();
        this._pattern.destroy();
        this._renderer.destroy();
        this._canvas.removeEventListener('mousemove', this._mouseMoveHandler);
        this._canvas.removeEventListener('click', this._mouseClickHandler);
    }
}
