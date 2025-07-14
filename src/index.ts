/**
 * ASCIIGround - a library for creating ASCII backgrounds.
 */

export interface ASCIIGroundOptions {
    /** Animation pattern type. */
    pattern: 'perlin' | 'wave' | 'rain' | 'static'
    /** ASCII characters to use for rendering (from lightest to darkest). */
    characters: string[]
    /** Animation speed multiplier. */
    speed: number
    /** Font size in pixels. */
    fontSize?: number
    /** Font family. */
    fontFamily?: string
    /** Text color. */
    color?: string
    /** Background color. */
    backgroundColor?: string
}

export interface NoiseFunction {
  (x: number, y: number, time: number): number
}

/**
 * Simple Perlin noise implementation.
 */
class PerlinNoise {
    private permutation: number[];
  
    constructor(seed: number = 0) {
        this.permutation = this.generatePermutation(seed);
    }
  
    private generatePermutation(seed: number): number[] {
        const p = [];

        for (let i = 0; i < 256; i++) 
            p[i] = i;
    
        for (let i = 255; i > 0; i--) {
            const j = Math.floor((seed * (i + 1)) % (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
            seed = (seed * 16807) % 2147483647;
        }
    
        return [...p, ...p];
    }
  
    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
  
    private lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }
  
    private grad(hash: number, x: number, y: number): number {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
  
    noise(x: number, y: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
    
        x -= Math.floor(x);
        y -= Math.floor(y);
    
        const u = this.fade(x);
        const v = this.fade(y);
    
        const a = this.permutation[X] + Y;
        const aa = this.permutation[a];
        const ab = this.permutation[a + 1];
        const b = this.permutation[X + 1] + Y;
        const ba = this.permutation[b];
        const bb = this.permutation[b + 1];
    
        return this.lerp(
            this.lerp(
                this.grad(this.permutation[aa], x, y),
                this.grad(this.permutation[ba], x - 1, y),
                u
            ),
            this.lerp(
                this.grad(this.permutation[ab], x, y - 1),
                this.grad(this.permutation[bb], x - 1, y - 1),
                u
            ),
            v
        );
    }
}

/**
 * Main ASCIIGround class for creating backgrounds.
 */
export class ASCIIGround {
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _options: Required<ASCIIGroundOptions>;
    private _animationId: number | null = null;
    private _startTime: number = 0;
    private _currentTime: number = performance.now();
    private _perlin: PerlinNoise;
    private _cols: number = 0;
    private _rows: number = 0;
    private _charWidth: number = 0;
    private _charHeight: number = 0;

    /**
     * Check if the animation is currently running.
     */
    get isAnimating(): boolean {
        return this._animationId !== null;
    }
  
    constructor(canvas: HTMLCanvasElement, options: ASCIIGroundOptions) {
        this._canvas = canvas;
        const context = canvas.getContext('2d');

        if (!context) 
            throw new Error('Could not get 2D context from the canvas.');
    
        this._context = context;
    
        this._options = {
            pattern: options.pattern,
            characters: options.characters,
            speed: options.speed,
            fontSize: options.fontSize || 12,
            fontFamily: options.fontFamily || 'monospace',
            color: options.color || '#00ff00',
            backgroundColor: options.backgroundColor || '#000000',
        };
    
        this._perlin = new PerlinNoise();
    }

    private configureCanvas(): void {
        this._context.font = `${this._options.fontSize}px ${this._options.fontFamily}`;
        this._context.textBaseline = 'top';
    
        // Measure character dimensions.
        const metrics = this._context.measureText('M');
        this._charWidth = metrics.width;
        this._charHeight = this._options.fontSize;
    
        // Calculate grid dimensions.
        this._cols = Math.floor(this._canvas.width / this._charWidth);
        this._rows = Math.floor(this._canvas.height / this._charHeight);
    }
  
    private getNoiseFunction(): NoiseFunction {
        switch (this._options.pattern) {
            case 'perlin':
                return (x: number, y: number, time: number) => {
                    return this._perlin.noise(x * 0.1, y * 0.1 + time);
                };
      
            case 'wave':
                return (x: number, y: number, time: number) => {
                    return Math.sin(x * 0.1 + time) * Math.cos(y * 0.1 + time * 0.5);
                };
      
            case 'rain':
                return (x: number, y: number, time: number) => {
                    return Math.sin(y * 0.2 + time * 2) * Math.cos(x * 0.05);
                };
      
            case 'static':
                return () => Math.random() * 2 - 1;
      
            default:
                return () => 0;
        }
    }
  
    private render(time: number): void {
        this._context.fillStyle = this._options.backgroundColor;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fillStyle = this._options.color;
        const noiseFunction = this.getNoiseFunction();
        const animationTime = (time - this._startTime) * this._options.speed;
    
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                const noiseValue = noiseFunction(col, row, animationTime);

                // Map noise value (-1 to 1) to character index.
                const normalizedValue = (noiseValue + 1) / 2;
                const charIndex = Math.floor(normalizedValue * this._options.characters.length);
                const clampedIndex = Math.max(0, Math.min(charIndex, this._options.characters.length - 1));
                const char = this._options.characters[clampedIndex];
                const x = col * this._charWidth;
                const y = row * this._charHeight;
                this._context.fillText(char, x, y);
            }
        }
    }

    /**
     * Initialize the canvas and render the initial state.
     */
    init(): ASCIIGround {
        this.configureCanvas();
        this.render(this._currentTime);
        return this;
    }
  
    /**
     * Start the animation.
     */
    startAnimation(): void {
        if (this._animationId !== null)
            throw new Error('Animation is already running!');
    
        this._startTime = performance.now();
    
        const animate = (time: number) => {
            this._currentTime = time;
            this.render(time);
            this._animationId = requestAnimationFrame(animate);
        };
    
        this._animationId = requestAnimationFrame(animate);
    }
  
    /**
     * Stop the animation.
     */
    stopAnimation(): void {
        if (this._animationId !== null) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }
    }

    /**
     * Update animation options.
     */
    updateOptions(newOptions: Partial<ASCIIGroundOptions>): void {
        this._options = { ...this._options, ...newOptions };
        this.init();
    }
  
    /**
     * Resize the canvas and recalculate grid.
     */
    resize(width: number, height: number): void {
        this._canvas.width = width;
        this._canvas.height = height;
        this.configureCanvas();

        if (!this.isAnimating)
            this.render(this._currentTime);
    }
}

/**
 * Utility function to create an ASCII background that fills the entire page.
 */
export function createFullPageBackground(options: ASCIIGroundOptions): ASCIIGround {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const asciiGround = new ASCIIGround(canvas, options);
  
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        asciiGround.resize(canvas.width, canvas.height);
    };
  
    window.addEventListener('resize', handleResize);
  
    return asciiGround;
}

export default ASCIIGround;
