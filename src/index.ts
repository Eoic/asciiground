/**
 * ASCIIGround - a library for creating ASCII backgrounds.
 */

export interface ASCIIGroundOptions {
    /** Animation pattern type. */
    pattern: 'perlin' | 'wave' | 'rain' | 'static' | 'japan-rain'
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

    /** Direction of animation, if supported by the pattern. */
    direction?: 'left' | 'right' | 'up' | 'down'
    /** Horizontal wave amplitude (for wave pattern). */
    amplitudeX?: number
    /** Vertical wave amplitude (for wave pattern). */
    amplitudeY?: number
    /** Frequency of wave pattern. */
    frequency?: number
    /** Perlin noise scale factor. */
    noiseScale?: number
    /** Rain density (for rain/japan-rain patterns), 0-1. */
    rainDensity?: number
    /** Rain direction (for rain pattern). */
    rainDirection?: 'vertical' | 'diagonal-left' | 'diagonal-right'
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

interface JapanRainDrop {
    col: number;
    y: number;
    speed: number;
    chars: string[];
    length: number;
    age: number;
}

function randomJapaneseChar(): string {
    const ranges = [
        [0x30A0, 0x30FF], // Katakana
        [0x3040, 0x309F], // Hiragana
        [0x4E00, 0x4E80], // Some Kanji (short range for visual effect)
    ];
    const [start, end] = ranges[Math.floor(Math.random() * ranges.length)];
    return String.fromCharCode(Math.floor(Math.random() * (end - start)) + start);
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
    private japanRainDrops: JapanRainDrop[] = [];
    // Removed unused lastRainInit
    private rainDropDensity: number = 0.9;

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
            // new options with defaults
            direction: options.direction || 'down',
            amplitudeX: options.amplitudeX ?? 1,
            amplitudeY: options.amplitudeY ?? 1,
            frequency: options.frequency ?? 1,
            noiseScale: options.noiseScale ?? 0.1,
            rainDensity: options.rainDensity ?? 0.9,
            rainDirection: options.rainDirection ?? 'vertical'
        };
    
        this.rainDropDensity = this.options.rainDensity;
        this.perlin = new PerlinNoise();
        this.setupCanvas();
        if (this.options.pattern === 'japan-rain') {
            this.initJapanRain();
        }
    }
  
    private setupCanvas(): void {
        this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
        this.ctx.textBaseline = 'top';
    
        // Measure character dimensions.
        const metrics = this.ctx.measureText('Ｍ'); // Fullwidth M for better width
        this.charWidth = metrics.width;
        this.charHeight = this.options.fontSize;
    
        // Calculate grid dimensions.
        this.cols = Math.floor(this.canvas.width / this.charWidth);
        this.rows = Math.floor(this.canvas.height / this.charHeight);

        // For matrix rain, adjust drops
        if (this.options.pattern === 'japan-rain') {
            this.initJapanRain();
        }
    }

    private getNoiseFunction(): NoiseFunction {
        const { noiseScale, direction, amplitudeX, amplitudeY, frequency, rainDirection } = this.options;
        switch (this.options.pattern) {
            case 'perlin':
                return (x: number, y: number, time: number) => {
                    // Allow directionality by shifting axes
                    let dx = x, dy = y;
                    switch (direction) {
                        case 'left':  dx = -x; break;
                        case 'right': dx = x; break;
                        case 'up':    dy = -y; break;
                        case 'down':  dy = y; break;
                    }
                    return this.perlin.noise(dx * noiseScale, dy * noiseScale + time);
                };
      
            case 'wave':
                return (x: number, y: number, time: number) => {
                    let t = time * frequency;
                    let _x = x, _y = y;
                    switch (direction) {
                        case 'left':  t = -t; break;
                        case 'right': t = t; break;
                        case 'up':    t = -t; break;
                        case 'down':  t = t; break;
                    }
                    return (
                        Math.sin(_x * 0.1 * amplitudeX + t) * Math.cos(_y * 0.1 * amplitudeY + t * 0.5)
                    );
                };
      
            case 'rain':
                return (x: number, y: number, time: number) => {
                    let angle = 0;
                    switch (rainDirection) {
                        case 'vertical':      angle = 0; break;
                        case 'diagonal-left': angle = Math.PI / 4; break;
                        case 'diagonal-right':angle = -Math.PI / 4; break;
                    }
                    // Move "rain" along a direction
                    const dx = Math.cos(angle), dy = Math.sin(angle);
                    return Math.sin((y * dy + x * dx) * 0.2 + time * 2) * Math.cos(x * 0.05);
                };
      
            case 'static':
                return () => Math.random() * 2 - 1;

            // 'japan-rain' handled elsewhere
            default:
                return () => 0;
        }
    }

    private initJapanRain(): void {
        this.japanRainDrops = [];
        this.rainDropDensity = this.options.rainDensity ?? 0.9;
        for (let col = 0; col < this.cols; col++) {
            if (Math.random() < this.rainDropDensity) {
                const length = Math.floor(Math.random() * 20) + 8;
                const chars = Array.from({ length }, () => randomJapaneseChar());
                this.japanRainDrops.push({
                    col,
                    y: Math.floor(Math.random() * this.rows),
                    speed: 0.5 + Math.random() * 1.2,
                    chars,
                    length,
                    age: 0,
                });
            }
        }
        // Removed this.lastRainInit = performance.now(); as lastRainInit is not used
    }

    // Remove unused parameter 'time' from updateJapanRainDrops
    private updateJapanRainDrops(): void {
        for (const drop of this.japanRainDrops) {
            drop.y += drop.speed * this.options.speed;
            drop.age += this.options.speed;
            // Randomly change some chars for the "glitch" effect
            if (Math.random() < 0.04) {
                let idx = Math.floor(Math.random() * drop.length);
                drop.chars[idx] = randomJapaneseChar();
            }
            // Reset drop if off screen
            if (drop.y - drop.length > this.rows) {
                drop.y = -Math.floor(Math.random() * 8);
                drop.length = Math.floor(Math.random() * 20) + 8;
                drop.chars = Array.from({ length: drop.length }, () => randomJapaneseChar());
                drop.speed = 0.5 + Math.random() * 1.2;
                drop.age = 0;
            }
        }
        // If the canvas was resized, adjust drops
        if (this.japanRainDrops.length < this.cols * this.rainDropDensity) {
            for (let col = this.japanRainDrops.length; col < this.cols * this.rainDropDensity; col++) {
                const length = Math.floor(Math.random() * 20) + 8;
                const chars = Array.from({ length }, () => randomJapaneseChar());
                this.japanRainDrops.push({
                    col: col % this.cols,
                    y: Math.floor(Math.random() * this.rows),
                    speed: 0.5 + Math.random() * 1.2,
                    chars,
                    length,
                    age: 0,
                });
            }
        }
    }

    private renderJapanRain(): void {
        // translucent background to give trailing effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const drop of this.japanRainDrops) {
            for (let i = 0; i < drop.length; i++) {
                const char = drop.chars[i];
                const x = drop.col * this.charWidth;
                const y = (Math.floor(drop.y) - i) * this.charHeight;
                if (y < 0 || y > this.canvas.height) continue;
                if (i === 0) {
                    // Leading char brighter
                    this.ctx.fillStyle = '#ccffcc';
                } else if (i < 3) {
                    this.ctx.fillStyle = this.options.color || '#00ff00';
                } else {
                    this.ctx.fillStyle = 'rgba(0,255,0,0.7)';
                }
                this.ctx.fillText(char, x, y);
            }
        }
    }
  
    private render(time: number): void {
        if (this.options.pattern === 'japan-rain') {
            this.updateJapanRainDrops();
            this.renderJapanRain();
            return;
        }

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
        const prevPattern = this.options.pattern;
        this.options = { ...this.options, ...newOptions };
        // Apply rainDensity if updated
        if (typeof newOptions.rainDensity === 'number') {
            this.rainDropDensity = newOptions.rainDensity;
        }
        this.setupCanvas();
        if (this.options.pattern === 'japan-rain' && prevPattern !== 'japan-rain') {
            this.initJapanRain();
        }
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