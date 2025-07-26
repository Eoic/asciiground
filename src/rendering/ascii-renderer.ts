import { DummyPattern } from '../patterns/dummy-pattern';
import { Pattern, type PatternContext, type RenderRegion, type CharacterData } from '../patterns/pattern';
import { type Renderer, createRenderer } from './renderer';

/**
 * Configuration options for the ASCII renderer.
 * @category Rendering
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
    /** Resize target for the renderer, defaults to window. */
    resizeTo: Window | HTMLElement
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
    resizeTo: window,
};

const initState = () => ({
    canvas: null as HTMLCanvasElement | null,
    renderer: null as Renderer | null,
    pattern: null as Pattern | null,
    region: null as RenderRegion | null,
    options: DEFAULT_OPTIONS,
    lastTime: 0,
    animationId: null as number | null,
    animationTime: 0,
    mouseX: 0,
    mouseY: 0,
    mouseClicked: false,
    tempCanvas: null as HTMLCanvasElement | null,
    tempContext: null as CanvasRenderingContext2D | null,
    lastHash: 0,
    isDirty: true,
    resizeObserver: null as ResizeObserver | null,
});

/**
 * Main ASCII renderer that coordinates pattern generation with rendering back-ends.
 * Supports both 2D canvas and WebGL rendering with automatic fallback.
 * @category Rendering
 */
export class ASCIIRenderer {
    private _state = initState();
    private _handleResize: VoidFunction;

    /**
     * Get the current rendering options.
     * @returns The current ASCIIRendererOptions.
     */
    public get options(): ASCIIRendererOptions {
        return this._state.options;
    }

    /** Get the current pattern generator. */
    public get pattern(): Pattern {
        if (!this._state.pattern) 
            throw new Error('Pattern not initialized');

        return this._state.pattern;
    }

    /** Set a new pattern generator for the renderer. */
    public set pattern(pattern: Pattern) {
        if (this._state.pattern) 
            this._state.pattern.destroy();

        this._state.pattern = pattern;

        if (this._state.region) 
            this._state.pattern.initialize(this._state.region);

        this._resetAnimationTime();
    }

    /** Whether the renderer is currently animating. */
    public get isAnimating(): boolean {
        return this._state.options.animated;
    }

    /**
     * Get the canvas element, throwing an error if not initialized.
     */
    private get canvas(): HTMLCanvasElement {
        if (!this._state.canvas)
            throw new Error('Canvas not initialized.');

        return this._state.canvas;
    }

    /**
     * Get the renderer, throwing an error if not initialized.
     */
    private get renderer(): Renderer {
        if (!this._state.renderer)
            throw new Error('Renderer not initialized.');

        return this._state.renderer;
    }

    /**
     * Get the region, throwing an error if not calculated.
     */
    private get region(): RenderRegion {
        if (!this._state.region)
            throw new Error('Region not calculated.');

        return this._state.region;
    }

    /**
     * Get the temp context, ensuring it's initialized.
     */
    private get tempContext(): CanvasRenderingContext2D {
        if (!this._state.tempCanvas) {
            this._state.tempCanvas = document.createElement('canvas');
            this._state.tempContext = this._state.tempCanvas.getContext('2d');

            if (!this._state.tempContext)
                throw new Error('Failed to create 2D context for temp canvas');
        }

        if (!this._state.tempContext)
            throw new Error('Temp context not initialized.');

        return this._state.tempContext;
    }

    /**
     * Create a new ASCII renderer.
     * @param canvas - the canvas element to render to.
     * @param pattern - the pattern generator to use.
     * @param options - rendering options.
     */
    constructor(canvas: HTMLCanvasElement, pattern?: Pattern, options: Partial<ASCIIRendererOptions> = {}) {
        this._state.canvas = canvas;
        this._state.pattern = pattern || new DummyPattern();
        this._handleResize = this.resize.bind(this);

        this._state.options = {
            ...DEFAULT_OPTIONS,
            ...options,
        };

        this._state.renderer = createRenderer(this._state.options.rendererType || '2D');
        this._state.region = this._calculateRegion();
        this._setupRenderer();

        if (this._state.options.enableMouseInteraction) 
            this._setupMouseEvents();
    }

    /**
     * Render a single frame.
     */
    public render(time: number = performance.now()): void {
        const deltaTime = time - this._state.lastTime;
        this._state.lastTime = time;

        if (this._state.options.animated)
            this._state.animationTime += (deltaTime / 1000) * this._state.options.animationSpeed;

        const context: PatternContext = {
            time: this._state.animationTime,
            deltaTime: deltaTime / 1000,
            animationTime: this._state.animationTime,
            region: this.region,
            mouseX: this._state.mouseX,
            mouseY: this._state.mouseY,
            clicked: this._state.mouseClicked,
            isAnimating: this._state.options.animated,
            animationSpeed: this._state.options.animationSpeed,
        };

        this._state.mouseClicked = false;
        const characters = this.pattern.update(context).generate(context);

        if (!this._hasOutputChanged(characters) && !this._state.isDirty && !this.pattern.isDirty)
            return;

        this._state.isDirty = false;
        this.pattern.isDirty = false;
        this._state.lastHash = this._hash(characters);
        this.renderer.clear(this._state.options.backgroundColor);
        this.renderer.render(characters, this.region);
    }

    /**
     * Start animation loop.
     */
    public startAnimation(): void {
        this._state.options.animated = true;
        this._state.lastTime = performance.now();

        const animate = (time: number) => {
            if (!this.isAnimating)
                return;

            this.render(time);
            this._state.animationId = requestAnimationFrame(animate);
        };

        this._state.animationId = requestAnimationFrame(animate);
    }

    /**
     * Stop animation loop.
     */
    public stopAnimation(): void {
        this._state.options.animated = false;

        if (this._state.animationId !== null) {
            cancelAnimationFrame(this._state.animationId);
            this._state.animationId = null;
        }
    }

    /**
     * Update rendering options.
     */
    public setOptions(newOptions: Partial<ASCIIRendererOptions>): void {
        const oldOptions = this._state.options;
        this._state.options = { ...oldOptions, ...newOptions };
        this._state.isDirty = this._hasOptionsChanged(oldOptions);
        this._state.region = this._calculateRegion();
        this.pattern.initialize(this._state.region);
        this.renderer.options = this._state.options;
        this._syncAnimationState();
    }

    /**
     * Resize the canvas and recalculate layout.
     */
    public resize(): void {
        const width = this._state.options.resizeTo instanceof HTMLElement
            ? this._state.options.resizeTo.clientWidth
            : this._state.options.resizeTo.innerWidth;

        const height = this._state.options.resizeTo instanceof HTMLElement
            ? this._state.options.resizeTo.clientHeight
            : this._state.options.resizeTo.innerHeight;

        this.canvas.width = width;
        this.canvas.height = height;
        this._state.region = this._calculateRegion();
        this.renderer.resize(width, height);
        this.pattern.initialize(this._state.region);

        if (!this.isAnimating) {
            this._state.isDirty = true;
            this.render();
        }
    }

    /**
     * Cleanup resources and stop animation.
     */
    public destroy(): void {
        this.stopAnimation();
        this._state.pattern?.destroy();
        this._state.renderer?.destroy();
        this._state.canvas?.removeEventListener('mousemove', this._mouseMoveHandler);
        this._state.canvas?.removeEventListener('click', this._mouseClickHandler);
        this._state.options.resizeTo.removeEventListener('resize', this._handleResize);
        this._state.resizeObserver?.disconnect();
        this._state = initState();
    }

    /**
     * Calculate character spacing based on font metrics.
     * @returns A tuple containing the character width, height, and spacing sizes.
     */
    private _calculateSpacing(): [number, number, number, number] {
        let maxCharWidth = 0;

        for (const char of this.pattern.options.characters) {
            const metrics = this.tempContext.measureText(char);
            maxCharWidth = Math.max(maxCharWidth, metrics.width);
        }

        const charWidth = maxCharWidth;
        const heightMetrics = this.tempContext.measureText(this.pattern.options.characters.join(''));
        const measuredHeight = heightMetrics.actualBoundingBoxAscent + heightMetrics.actualBoundingBoxDescent;
        const charHeight = Math.max(measuredHeight, this._state.options.fontSize);

        const charSpacingX = (this._state.options.charSpacingX && this._state.options.charSpacingX > 0) 
            ? this._state.options.charSpacingX 
            : charWidth;

        const charSpacingY = (this._state.options.charSpacingY && this._state.options.charSpacingY > 0) 
            ? this._state.options.charSpacingY 
            : Math.max(charHeight, this._state.options.fontSize * 1.2);

        return [charWidth, charHeight, charSpacingX, charSpacingY];
    }

    /**
     * Calculate the rendering region based on canvas size and options.
     * @returns The calculated RenderRegion object.
     */
    private _calculateRegion(): RenderRegion {
        this.tempContext.font = `${this._state.options.fontSize}px ${this._state.options.fontFamily}`;
        const [charWidth, charHeight, charSpacingX, charSpacingY] = this._calculateSpacing();
        const cols = Math.floor((this.canvas.width / charSpacingX));
        const rows = Math.floor((this.canvas.height / charSpacingY));

        return {
            startColumn: this._state.options.padding,
            endColumn: cols - this._state.options.padding,
            startRow: this._state.options.padding,
            endRow: rows - this._state.options.padding,
            columns: cols,
            rows: rows,
            charWidth,
            charHeight,
            charSpacingX,
            charSpacingY,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
        };
    }

    /**
     * Initialize the renderer with the canvas and options.
     * This sets up the rendering context and prepares for rendering.
     */
    private _setupRenderer(): void {
        this.renderer.initialize(this.canvas, this._state.options);
        this.pattern.initialize(this.region);

        if (this._state.options.resizeTo instanceof HTMLElement) {
            this._state.resizeObserver = new ResizeObserver(this._handleResize);
            this._state.resizeObserver.observe(this._state.options.resizeTo);
        } else this._state.options.resizeTo.addEventListener('resize', this._handleResize);
    }

    /**
     * Handle mouse move events to update mouse position.
     * @param event Mouse event to handle.
     */
    private _mouseMoveHandler = (event: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        this._state.mouseX = event.clientX - rect.left;
        this._state.mouseY = event.clientY - rect.top;
    };

    /**
     * Handle mouse click events to update clicked state.
     * This can be used by patterns to respond to user input.
     */
    private _mouseClickHandler = () => {
        this._state.mouseClicked = true;
    };
    
    /**
     * Setup mouse event listeners for interaction.
     * This allows patterns to respond to mouse movements and clicks.
     */
    private _setupMouseEvents(): void {
        this.canvas.addEventListener('mousemove', this._mouseMoveHandler);
        this.canvas.addEventListener('click', this._mouseClickHandler);
    }

    /**
     * Reset the animation time to zero.
     * Useful when restarting animations or switching patterns.
     */
    private _resetAnimationTime(): void {
        this._state.animationTime = 0;
    }

    /**
     * Synchronize animation state with the current options.
     * This ensures that the renderer reflects the current animation settings.
     */
    private _syncAnimationState(): void {
        if (this._state.options.animated && this._state.animationId === null)
            this.startAnimation();
        else if (!this._state.options.animated && this._state.animationId !== null) 
            this.stopAnimation();
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
        return this._hash(list) !== this._state.lastHash;
    }

    /**
     * Check if the new options differ from the current ones.
     * @param options - the options to compare against current options.
     * @returns True if any option has changed, false otherwise.
     */
    private _hasOptionsChanged(options: Partial<ASCIIRendererOptions>): boolean {
        return Object.keys(options).some((key) => {
            const oldValue = this._state.options[key as keyof ASCIIRendererOptions];
            const newValue = options[key as keyof ASCIIRendererOptions];
            return oldValue !== newValue;
        });
    }
}
