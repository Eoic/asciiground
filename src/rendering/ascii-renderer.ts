import { DummyPattern } from '../patterns/dummy-pattern';
import { Pattern, type PatternContext, type RenderRegion } from '../patterns/pattern';
import { type Renderer, createRenderer } from './renderer';

export interface ASCIIRendererOptions {
    color: string;
    animated: boolean;
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
    animated: false,
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
    private _animationTime: number = 0;
    private _mouseX: number = 0;
    private _mouseY: number = 0;
    private _mouseClicked: boolean = false;
    private _tempCanvas: HTMLCanvasElement | null = null;
    private _tempContext: CanvasRenderingContext2D | null = null;

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
        this.resetAnimationTime();
    }

    public get isAnimating(): boolean {
        return this._options.animated;
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
        if (!this._tempCanvas) {
            this._tempCanvas = document.createElement('canvas');
            this._tempContext = this._tempCanvas.getContext('2d')!;
        }

        this._tempContext!.font = `${this._options.fontSize}px ${this._options.fontFamily}`;

        // For character width, we need to account for the widest characters that might appear.
        // Use a representative set of wide ASCII characters to prevent overlap.
        const widthTestChars = ['M', 'W', '@', '#', '0', '8'];
        
        // Also test common Japanese characters if pattern uses them
        const patternChars = Array.isArray(this._pattern.options.characters) 
            ? this._pattern.options.characters.join('') 
            : (this._pattern.options.characters || '');
        const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(patternChars);
        if (hasJapanese) {
            // Add wide Japanese characters for testing
            widthTestChars.push('あ', 'ア', '漢', '龍', 'Ｍ', 'Ｗ');
        }
        
        let maxCharWidth = 0;

        for (const char of widthTestChars) {
            const metrics = this._tempContext!.measureText(char);
            maxCharWidth = Math.max(maxCharWidth, metrics.width);
        }
        
        const charWidth = maxCharWidth;
        
        // Calculate safe rendering height to prevent character overlap.
        // Use a representative string that includes characters with ascenders and descenders
        // to ensure we capture the full vertical range needed for any ASCII character.
        const heightMetrics = this._tempContext!.measureText('Áy@|');
        const measuredHeight = heightMetrics.actualBoundingBoxAscent + heightMetrics.actualBoundingBoxDescent;
        
        // Ensure minimum line height based on font size to prevent overlap.
        // Use 1.2x font size as minimum, which is a standard line height multiplier
        // that provides adequate spacing between text lines.
        const minLineHeight = this._options.fontSize * 1.2;
        const charHeight = Math.max(measuredHeight, minLineHeight);
        
        // Calculate tighter spacing for grid positioning to fill the screen better.
        // Use a slightly reduced vertical spacing while ensuring no overlap.
        const charSpacingY = Math.max(measuredHeight * 0.9, this._options.fontSize * 0.9);
        
        // For horizontal spacing, use the measured max width for non-monospace fonts
        // and apply consistent spacing for monospace fonts.
        const isMonospace = this._options.fontFamily === 'monospace';
        let charSpacingX = isMonospace ? Math.max(charWidth, charSpacingY * 0.6) : charWidth;
        
        // Add extra spacing for Japanese characters to prevent overlap
        if (hasJapanese)
            charSpacingX *= 1.1; // 10% extra spacing for Japanese characters
        
        const padding = this._options.renderPadding || 0;
        const cols = Math.floor((this._canvas.width - padding * 2) / charSpacingX);
        const rows = Math.floor((this._canvas.height - padding * 2) / charSpacingY);

        return {
            startColumn: -padding,
            endColumn: cols + padding,
            startRow: -padding,
            endRow: rows + padding,
            columns: cols,
            rows,
            charWidth,
            charHeight,
            charSpacingX,
            charSpacingY,
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

        if (this._options.animated)
            this._animationTime += (deltaTime / 1000) * this._pattern.options.animationSpeed;

        const context: PatternContext = {
            time: this._animationTime,
            deltaTime: deltaTime / 1000,
            animationTime: this._animationTime,
            region: this._region,
            mouseX: this._mouseX,
            mouseY: this._mouseY,
            clicked: this._mouseClicked,
            isAnimating: this._options.animated,
        };

        this._mouseClicked = false;
        const characters = this._pattern.update(context).generate(context);
        this._renderer.clear(this._options.backgroundColor);
        this._renderer.render(characters, this._region);
    }

    /**
     * Start animation loop.
     */
    public startAnimation(): void {
        this._options.animated = true;
        this._lastTime = performance.now();

        const animate = (time: number) => {
            if (!this.isAnimating)
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
        this._options.animated = false;

        if (this._animationId !== null) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }
    }

    /**
     * Reset the animation time to zero.
     * Useful when restarting animations or switching patterns.
     */
    public resetAnimationTime(): void {
        this._animationTime = 0;
    }

    /**
     * Synchronize animation state with the current options.
     * This ensures that the renderer reflects the current animation settings.
     */
    public syncAnimationState(): void {
        if (this._options.animated && this._animationId === null)
            this.startAnimation();
        else if (!this._options.animated && this._animationId !== null) 
            this.stopAnimation();
    }

    /**
     * Update rendering options.
     */
    public updateOptions(newOptions: Partial<ASCIIRendererOptions>): void {
        const oldOptions = this._options;
        this._options = { ...oldOptions, ...newOptions };
        this._region = this._calculateRegion();
        this._pattern.initialize(this._region);
        this._renderer.options = this._options;
        this.syncAnimationState();
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

        if (!this.isAnimating) 
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
        this._tempCanvas = null;
        this._tempContext = null;
    }
}
