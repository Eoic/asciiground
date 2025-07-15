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

    public noise(x: number, y: number): number {
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
        [0x30A0, 0x30FF], // Katakana.
        [0x3040, 0x309F], // Hiragana.
        [0x4E00, 0x4E80]  // Some Kanji (short range for visual effect).
    ];

    const [start, end] = ranges[Math.floor(Math.random() * ranges.length)];
    return String.fromCharCode(Math.floor(Math.random() * (end - start)) + start);
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
    private _japanRainDrops: JapanRainDrop[] = [];
    private _rainDropDensity: number = 0.9;

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
            direction: options.direction || 'down',
            amplitudeX: options.amplitudeX ?? 1,
            amplitudeY: options.amplitudeY ?? 1,
            frequency: options.frequency ?? 1,
            noiseScale: options.noiseScale ?? 0.1,
            rainDensity: options.rainDensity ?? 0.9,
            rainDirection: options.rainDirection ?? 'vertical',
        };
    
        this._perlin = new PerlinNoise();
        this._rainDropDensity = this._options.rainDensity;
        this.configureCanvas();

        if (this._options.pattern === 'japan-rain')
            this.initJapanRain();
    }

    private configureCanvas(): void {
        this._context.font = `${this._options.fontSize}px ${this._options.fontFamily}`;
        this._context.textBaseline = 'top';
    
        // Measure character dimensions.
        const metrics = this._context.measureText('Ｍ');
        this._charWidth = metrics.width;
        this._charHeight = this._options.fontSize;
    
        // Calculate grid dimensions.
        this._cols = Math.floor(this._canvas.width / this._charWidth);
        this._rows = Math.floor(this._canvas.height / this._charHeight);
    }

    private getNoiseFunction(): NoiseFunction {
        const { noiseScale, direction, amplitudeX, amplitudeY, frequency, rainDirection } = this._options;
        switch (this._options.pattern) {
            case 'perlin':
                return (x: number, y: number, time: number) => {
                    let dx = x, dy = y;
                    switch (direction) {
                        case 'left':  dx = -x; break;
                        case 'right': dx = x; break;
                        case 'up':    dy = -y; break;
                        case 'down':  dy = y; break;
                    }
                    return this._perlin.noise(dx * noiseScale, dy * noiseScale + time);
                };
            case 'wave':
                return (x: number, y: number, time: number) => {
                    let t = time * frequency;
                    const _x = x, _y = y;

                    switch (direction) {
                        case 'left':  t = -t; break;
                        // case 'right': t = t; break;
                        case 'up':    t = -t; break;
                        // case 'down':  t = t; break;
                    }

                    return (
                        Math.sin(_x * 0.1 * amplitudeX + t) * 
                        Math.cos(_y * 0.1 * amplitudeY + t * 0.5)
                    );
                };
            case 'rain':
                return (x: number, y: number, time: number) => {
                    let angle = 0;

                    switch (rainDirection) {
                        case 'vertical':
                            angle = 0;
                            break;
                        case 'diagonal-left':
                            angle = Math.PI / 4;
                            break;
                        case 'diagonal-right':
                            angle = -Math.PI / 4;
                            break;
                    }

                    const dx = Math.cos(angle), dy = Math.sin(angle);
                    return Math.sin((y * dy + x * dx) * 0.2 + time * 2) * Math.cos(x * 0.05);
                };
            case 'static':
                return () => Math.random() * 2 - 1;
            default:
                return () => 0;
        }
    }

    private initJapanRain(): void {
        this._japanRainDrops = [];
        this._rainDropDensity = this._options.rainDensity ?? 0.9;

        for (let col = 0; col < this._cols; col++) {
            if (Math.random() < this._rainDropDensity) {
                const length = Math.floor(Math.random() * 20) + 8;
                const chars = Array.from({ length }, () => randomJapaneseChar());

                this._japanRainDrops.push({
                    col,
                    y: Math.floor(Math.random() * this._rows),
                    speed: 0.5 + Math.random() * 1.2,
                    chars,
                    length,
                    age: 0,
                });
            }
        }
    }

    private updateJapanRainDrops(): void {
        for (const drop of this._japanRainDrops) {
            drop.y += drop.speed * this._options.speed;
            drop.age += this._options.speed;

            if (Math.random() < 0.04) {
                const idx = Math.floor(Math.random() * drop.length);
                drop.chars[idx] = randomJapaneseChar();
            }

            if (drop.y - drop.length > this._rows) {
                drop.y = -Math.floor(Math.random() * 8);
                drop.length = Math.floor(Math.random() * 20) + 8;
                drop.chars = Array.from({ length: drop.length }, () => randomJapaneseChar());
                drop.speed = 0.5 + Math.random() * 1.2;
                drop.age = 0;
            }
        }

        const neededDrops = Math.floor(this._cols * this._rainDropDensity);

        while (this._japanRainDrops.length < neededDrops) {
            const col = this._japanRainDrops.length % this._cols;
            const length = Math.floor(Math.random() * 20) + 8;
            const chars = Array.from({ length }, () => randomJapaneseChar());
            this._japanRainDrops.push({
                col,
                y: Math.floor(Math.random() * this._rows),
                speed: 0.5 + Math.random() * 1.2,
                chars,
                length,
                age: 0,
            });
        }

        if (this._japanRainDrops.length > neededDrops) 
            this._japanRainDrops.length = neededDrops;
    }

    private renderJapanRain(): void {
        this._context.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

        for (const drop of this._japanRainDrops) {
            for (let i = 0; i < drop.length; i++) {
                const char = drop.chars[i];
                const x = drop.col * this._charWidth;
                const y = (Math.floor(drop.y) - i) * this._charHeight;

                if (y < 0 || y > this._canvas.height)
                    continue;

                if (i === 0) 
                    this._context.fillStyle = '#ccffcc';
                else if (i < 3) 
                    this._context.fillStyle = this._options.color || '#00ff00';
                else 
                    this._context.fillStyle = 'rgba(0,255,0,0.7)';

                this._context.fillText(char, x, y);
            }
        }
    }
  
    private render(time: number): void {
        this._context.fillStyle = this._options.backgroundColor;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fillStyle = this._options.color;

        if (this._options.pattern === 'japan-rain') {
            this.updateJapanRainDrops();
            this.renderJapanRain();
            return;
        }

        this._context.fillStyle = this._options.backgroundColor;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fillStyle = this._options.color;
        const noiseFunction = this.getNoiseFunction();
        const animationTime = ((time - this._startTime) / 1000) * this._options.speed;

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
    // updateOptions(newOptions: Partial<ASCIIGroundOptions>): void {
    //     this._options = { ...this._options, ...newOptions };
    //     this.init();
    //     this.animationId = requestAnimationFrame(animate);
    // }
  
  
    updateOptions(newOptions: Partial<ASCIIGroundOptions>): void {
        this._options = { ...this._options, ...newOptions };

        if (typeof newOptions.rainDensity === 'number')
            this._rainDropDensity = newOptions.rainDensity;

        this.init();

        if (this._options.pattern === 'japan-rain')
            this.initJapanRain();
    }
  
    resize(width: number, height: number): void {
        this._canvas.width = width;
        this._canvas.height = height;
        this.configureCanvas();

        if (!this.isAnimating)
            this.render(this._currentTime);

        this._canvas.width = width;
        this._canvas.height = height;
        this.init();

        if (this._options.pattern === 'japan-rain')
            this.initJapanRain();
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
