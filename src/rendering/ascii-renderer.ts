import { DummyPattern } from '../patterns/dummy-pattern';
import { Pattern, type PatternContext, type RenderRegion, type CharacterData } from '../patterns/pattern';
import { type Renderer, createRenderer } from './renderer';

/**
 * Configuration options for the ASCII renderer.
 */
export interface ASCIIRendererOptions {
    /** Text color for rendered characters */
    color: string;
    /** Whether animation is enabled */
    animated: boolean;
    /** Animation speed multiplier */
    animationSpeed: number;
    /** Font size in pixels */
    fontSize: number;
    /** Font family to use for rendering */
    fontFamily: string;
    /** Background color */
    backgroundColor: string;
    /** Padding around the rendered area */
    padding: number;
    /** Renderer type to use */
    rendererType: '2D' | 'WebGL';
    /** Enable mouse interaction support */
    enableMouseInteraction: boolean;
    /** Horizontal spacing between characters. If not specified, auto-calculated based on character width */
    charSpacingX?: number;
    /** Vertical spacing between characters. If not specified, auto-calculated based on character height */
    charSpacingY?: number;
}

const DEFAULT_OPTIONS: ASCIIRendererOptions = {
    color: '#3e3e80ff',
    fontSize: 32,
    fontFamily: 'monospace',
    backgroundColor: '#181818ff',
    padding: 0,
    rendererType: '2D',
    enableMouseInteraction: false,
    animated: false,
    animationSpeed: 1,
    charSpacingX: undefined,
    charSpacingY: undefined,
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
    private _lastHash: number = 0;
    private _isDirty: boolean = true;

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

        // Calculate character dimensions for auto-spacing
        const widthTestChars = ['M', 'W', '@', '#', '0', '8'];
        let maxCharWidth = 0;

        for (const char of widthTestChars) {
            const metrics = this._tempContext!.measureText(char);
            maxCharWidth = Math.max(maxCharWidth, metrics.width);
        }

        // Calculate safe rendering height for auto-spacing
        const charWidth = maxCharWidth;
        const heightMetrics = this._tempContext!.measureText('Áy@|');
        const measuredHeight = heightMetrics.actualBoundingBoxAscent + heightMetrics.actualBoundingBoxDescent;
        const charHeight = Math.max(measuredHeight, this._options.fontSize);

        // Use user-specified spacing or calculate automatically
        const charSpacingX = (this._options.charSpacingX && this._options.charSpacingX > 0) 
            ? this._options.charSpacingX 
            : charWidth;

        const charSpacingY = (this._options.charSpacingY && this._options.charSpacingY > 0) 
            ? this._options.charSpacingY 
            : Math.max(charHeight, this._options.fontSize * 1.2);
        
        const cols = Math.floor((this._canvas.width / charSpacingX));
        const rows = Math.floor((this._canvas.height / charSpacingY));

        return {
            startColumn: this._options.padding,
            endColumn: cols - this._options.padding,
            startRow: this._options.padding,
            endRow: rows - this._options.padding,
            columns: cols,
            rows: rows,
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
            this._animationTime += (deltaTime / 1000) * this._options.animationSpeed;

        const context: PatternContext = {
            time: this._animationTime,
            deltaTime: deltaTime / 1000,
            animationTime: this._animationTime,
            region: this._region,
            mouseX: this._mouseX,
            mouseY: this._mouseY,
            clicked: this._mouseClicked,
            isAnimating: this._options.animated,
            animationSpeed: this._options.animationSpeed,
        };

        this._mouseClicked = false;
        const characters = this._pattern.update(context).generate(context);

        if (!this._hasOutputChanged(characters) && !this._isDirty)
            return;

        this._isDirty = false;
        this._lastHash = this._hash(characters);
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
        this._isDirty = this._hasOptionsChanged(oldOptions);
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

        if (!this.isAnimating) {
            this._isDirty = true;
            this.render();
        }
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

    /**
     * Generate a hash for the current character data list.
     * @param list - the character data list to hash.
     * @returns A numeric hash value.
     */
    private _hash(list: CharacterData[]): number {
        let hash = 0;

        for (const { x, y, char, color = '', opacity = 1, scale = 1, rotation = 0 } of list) {
            hash ^= (
                ((x * 31 + y * 17) ^ char.charCodeAt(0)) +
                (color.charCodeAt(0) || 0) * 13 +
                Math.floor(opacity * 100) * 7 +
                Math.floor(scale * 100) * 5 +
                Math.floor(rotation * 100) * 3
            );
        }

        return hash;
    }

    /**
     * Check if the output has changed since the last render.
     * This is used to avoid unnecessary rendering when nothing has changed.
     * @param list - the current character data list.
     * @returns True if the output has changed, false otherwise.
     */
    private _hasOutputChanged(list: CharacterData[]): boolean {
        return this._hash(list) !== this._lastHash;
    }

    /**
     * Check if the new options differ from the current ones.
     * @param options - the options to compare against current options.
     * @returns True if any option has changed, false otherwise.
     */
    private _hasOptionsChanged(options: Partial<ASCIIRendererOptions>): boolean {
        return Object.keys(options).some((key) => {
            const oldValue = this._options[key as keyof ASCIIRendererOptions];
            const newValue = options[key as keyof ASCIIRendererOptions];
            return oldValue !== newValue;
        });
    }
}
