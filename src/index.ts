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
    /** Whether the background is animated. */
    animated?: boolean
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
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private options: Required<ASCIIGroundOptions>;
    private animationId: number | null = null;
    private startTime: number = 0;
    private perlin: PerlinNoise;
    private cols: number = 0;
    private rows: number = 0;
    private charWidth: number = 0;
    private charHeight: number = 0;

    /**
     * Check if the animation is currently running.
     */
    get isAnimating(): boolean {
        return this.animationId !== null;
    }
  
    constructor(canvas: HTMLCanvasElement, options: ASCIIGroundOptions) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');

        if (!ctx) 
            throw new Error('Could not get 2D context from canvas.');
    
        this.ctx = ctx;
    
        this.options = {
            pattern: options.pattern,
            characters: options.characters,
            speed: options.speed,
            fontSize: options.fontSize || 12,
            fontFamily: options.fontFamily || 'monospace',
            color: options.color || '#00ff00',
            backgroundColor: options.backgroundColor || '#000000',
            animated: options.animated !== undefined ? options.animated : true,
        };
    
        this.perlin = new PerlinNoise();
        this.setupCanvas();
    }
  
    private setupCanvas(): void {
        // this.stop();
        // this.start();
        this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
        this.ctx.textBaseline = 'top';
    
        // Measure character dimensions.
        const metrics = this.ctx.measureText('M');
        this.charWidth = metrics.width;
        this.charHeight = this.options.fontSize;
    
        // Calculate grid dimensions.
        this.cols = Math.floor(this.canvas.width / this.charWidth);
        this.rows = Math.floor(this.canvas.height / this.charHeight);
    }
  
    private getNoiseFunction(): NoiseFunction {
        switch (this.options.pattern) {
            case 'perlin':
                return (x: number, y: number, time: number) => {
                    return this.perlin.noise(x * 0.1, y * 0.1 + time);
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
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.options.color;
        const noiseFunction = this.getNoiseFunction();
        const animationTime = (time - this.startTime) * this.options.speed;
    
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const noiseValue = noiseFunction(col, row, animationTime);

                // Map noise value (-1 to 1) to character index.
                const normalizedValue = (noiseValue + 1) / 2; // Convert to 0-1 range
                const charIndex = Math.floor(normalizedValue * this.options.characters.length);
                const clampedIndex = Math.max(0, Math.min(charIndex, this.options.characters.length - 1));
                const char = this.options.characters[clampedIndex];
                const x = col * this.charWidth;
                const y = row * this.charHeight;
                this.ctx.fillText(char, x, y);
            }
        }
    }
  
    /**
     * Start the animation.
     */
    start(): void {
        if (this.animationId !== null) 
            return;
    
        this.startTime = performance.now();
    
        const animate = (time: number) => {
            this.render(time);
            this.animationId = requestAnimationFrame(animate);
        };
    
        this.animationId = requestAnimationFrame(animate);
    }
  
    /**
     * Stop the animation.
     */
    stop(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
  
    /**
     * Update animation options.
     */
    updateOptions(newOptions: Partial<ASCIIGroundOptions>): void {
        this.options = { ...this.options, ...newOptions };
        this.setupCanvas();
    }
  
    /**
     * Resize the canvas and recalculate grid.
     */
    resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        this.setupCanvas();
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
