import { 
    Pattern, 
    type PatternOptions, 
    type CharacterData, 
    type PatternContext, 
    type RenderRegion 
} from './pattern';

/**
 * Options for configuring a Japanese rain pattern.
 * @extends PatternOptions
 * @property rainDensity - density of rain drops (0-1). Higher values create more rain streams.
 * @property minDropLength - minimum length of rain drops in characters.
 * @property maxDropLength - maximum length of rain drops in characters.
 * @property minSpeed - minimum falling speed multiplier for rain drops.
 * @property maxSpeed - maximum falling speed multiplier for rain drops.
 * @property mutationRate - probability of character mutation per frame (0-1).
 * @property fadeOpacity - background fade opacity for trail effect (0-1).
 */
interface JapaneseRainPatternOptions extends PatternOptions {
    rainDensity: number;
    minDropLength: number;
    maxDropLength: number;
    minSpeed: number;
    maxSpeed: number;
    mutationRate: number;
    fadeOpacity: number;
}

const DEFAULT_JAPANESE_RAIN_OPTIONS: Required<
    Pick<JapaneseRainPatternOptions, 
    keyof Omit<JapaneseRainPatternOptions, keyof PatternOptions>>
> = {
    rainDensity: 0.8,
    minDropLength: 8,
    maxDropLength: 25,
    minSpeed: 0.5,
    maxSpeed: 1.5,
    mutationRate: 0.04,
    fadeOpacity: 0.2,
};

/**
 * Represents a single rain drop falling down the screen.
 */
interface RainDrop {
    y: number;
    column: number;
    speed: number;
    length: number;
    lastMutationTime: number;
    characters: string[];
}

/**
 * Generates Japanese characters for the rain effect.
 * Uses provided characters or generates random Japanese characters.
 * @param availableChars - Optional array of characters to use instead of random generation
 * @returns A character for the rain effect
 */
function generateJapaneseCharacter(availableChars?: string[] | string): string {
    if (availableChars && (Array.isArray(availableChars) ? availableChars.length > 0 : availableChars.length > 0)) {
        const chars = typeof availableChars === 'string' 
            ? Array.from(availableChars) 
            : availableChars;

        return chars[Math.floor(Math.random() * chars.length)];
    }

    const ranges = [
        [0x30A0, 0x30FF], // Katakana
        [0x3040, 0x309F], // Hiragana
        [0x4E00, 0x4E80]  // Some Kanji (limited range for visual effect)
    ];

    const [start, end] = ranges[Math.floor(Math.random() * ranges.length)];
    const charCode = Math.floor(Math.random() * (end - start)) + start;
    const char = String.fromCharCode(charCode);
    
    // Fallback to ASCII if character generation fails
    if (!char || char === '\uFFFD') {
        const fallbackChars = 'アイウエオカキクサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        return fallbackChars[Math.floor(Math.random() * fallbackChars.length)];
    }
    
    return char;
}

/**
 * Matrix-style Japanese rain pattern that creates falling streams of Japanese characters.
 * Features configurable rain density, drop lengths, speeds, and character mutation.
 */
export class JapaneseRainPattern extends Pattern<JapaneseRainPatternOptions> {
    public static readonly ID = 'japanese-rain';

    private _rainDrops: RainDrop[] = [];
    private _region: RenderRegion | null = null;
    private _lastFrameCharacters: CharacterData[] = [];

    constructor(options: Partial<JapaneseRainPatternOptions> = {}) {
        const mergedOptions = {
            ...DEFAULT_JAPANESE_RAIN_OPTIONS,
            ...options,
        } as JapaneseRainPatternOptions;
        
        super(mergedOptions);
    }

    public initialize(region: RenderRegion): void {
        const hadDrops = this._rainDrops.length > 0;
        const oldRegion = this._region;
        
        this._region = region;
        
        // Only reset drops if this is the first initialization or region changed significantly
        if (!hadDrops || !oldRegion || 
            Math.abs(oldRegion.columns - region.columns) > 2 || 
            Math.abs(oldRegion.rows - region.rows) > 2) {
            this._rainDrops = [];
            this._lastFrameCharacters = [];
            this._initializeRainDrops();
        } else {
            // Preserve existing drops but adjust them to new region if needed
            this._adjustDropsToNewRegion(oldRegion, region);
            this._maintainRainDensity();
        }
    }

    public update(context: PatternContext): Pattern {
        if (!this._region) return this;

        this._updateRainDrops(context);
        this._maintainRainDensity();
        
        return this;
    }

    public generate(context: PatternContext): CharacterData[] {
        if (!this._region || this._rainDrops.length === 0) {
            // Ensure we have drops even if initialization failed
            if (this._region && this._rainDrops.length === 0)
                this._initializeRainDrops();
            
            if (this._rainDrops.length === 0)
                return [];
        }

        const characters: CharacterData[] = [];

        // Add fade effect by rendering previous frame with reduced opacity
        if (this._options.fadeOpacity > 0) {
            for (const prevChar of this._lastFrameCharacters) {
                characters.push({
                    ...prevChar,
                    opacity: this._options.fadeOpacity,
                });
            }
        }

        // Render current rain drops
        for (const drop of this._rainDrops) 
            this._renderRainDrop(drop, characters, context);

        this._lastFrameCharacters = characters.filter(char => char.opacity !== this._options.fadeOpacity);
        
        return characters;
    }

    private _initializeRainDrops(): void {
        if (!this._region) return;

        const targetDropCount = Math.floor(this._region.columns * this._options.rainDensity);
        
        // Ensure we have at least one drop
        const actualTargetCount = Math.max(1, targetDropCount);

        for (let i = 0; i < actualTargetCount; i++) {
            // Distribute drops randomly across all columns within the region bounds
            const column = Math.floor(Math.random() * this._region.columns) + this._region.startColumn;
            // Create drops with varied initial positions - some visible, some starting above
            const drop = this._createRainDrop(column, 0);
            
            // Make some drops immediately visible on screen for instant feedback
            if (i < Math.max(1, Math.floor(actualTargetCount * 0.3)))
                drop.y = Math.random() * this._region.rows;
            
            this._rainDrops.push(drop);
        }
    }

    private _createRainDrop(column: number, currentTime: number = 0): RainDrop {
        const length = Math.floor(
            Math.random() * (this._options.maxDropLength - this._options.minDropLength)
        ) + this._options.minDropLength;

        const characters = Array.from({ length }, () => generateJapaneseCharacter(this._options.characters));

        // Start above screen with random offset
        const y = -Math.floor(Math.random() * length) - Math.random() * 10;

        return {
            column,
            y,
            speed: Math.random() * (this._options.maxSpeed - this._options.minSpeed) + this._options.minSpeed,
            characters,
            length,
            lastMutationTime: currentTime,
        };
    }

    private _updateRainDrops(context: PatternContext): void {
        if (!this._region)
            return;

        // Use deltaTime for smooth movement like other patterns
        // const speedMultiplier = this.animationSpeed;

        for (const drop of this._rainDrops) {
            // Update position based on delta time (frame-independent movement)
            if (context.isAnimating)
                drop.y += drop.speed * context.animationSpeed * context.deltaTime;

            // Randomly mutate characters based on time
            if (context.animationTime - drop.lastMutationTime > 1 / this._options.mutationRate) {
                if (Math.random() < this._options.mutationRate) {
                    const charIndex = Math.floor(Math.random() * drop.length);
                    drop.characters[charIndex] = generateJapaneseCharacter(this._options.characters);
                    drop.lastMutationTime = context.animationTime;
                }
            }

            // Reset drop if it has fallen off screen (using region bounds)
            if (drop.y - drop.length > this._region.endRow) 
                this._resetRainDrop(drop, context.animationTime);
        }
    }

    private _resetRainDrop(drop: RainDrop, currentTime: number): void {
        if (!this._region) return;

        // Reset to start above screen
        drop.y = -Math.floor(Math.random() * 8) - drop.length;
        drop.lastMutationTime = currentTime;
        drop.length = Math.floor(
            Math.random() * (this._options.maxDropLength - this._options.minDropLength)
        ) + this._options.minDropLength;
        drop.characters = Array.from({ length: drop.length }, () => 
            generateJapaneseCharacter(this._options.characters)
        );
        drop.speed = Math.random() * (this._options.maxSpeed - this._options.minSpeed) + this._options.minSpeed;
        
        // Randomly assign a new column to ensure better distribution (within region bounds)
        drop.column = Math.floor(Math.random() * this._region.columns) + this._region.startColumn;
    }

    private _maintainRainDensity(): void {
        if (!this._region) return;

        const targetDropCount = Math.floor(this._region.columns * this._options.rainDensity);

        // Add drops if we're below target
        while (this._rainDrops.length < targetDropCount) {
            const column = (this._rainDrops.length % this._region.columns) + this._region.startColumn;
            const drop = this._createRainDrop(column, 0);
            
            // When adding new drops due to density increase, make some immediately visible
            // to provide instant visual feedback
            if (Math.random() < 0.4) { // 40% chance to be immediately visible
                drop.y = Math.random() * this._region.rows + this._region.startRow;
            }
            
            this._rainDrops.push(drop);
        }

        // Remove excess drops if we're above target
        if (this._rainDrops.length > targetDropCount) 
            this._rainDrops.length = targetDropCount;
    }

    /**
     * Adjust existing drops to fit a new region without losing current state.
     */
    private _adjustDropsToNewRegion(_oldRegion: RenderRegion, newRegion: RenderRegion): void {
        for (const drop of this._rainDrops) {
            // Adjust column to fit new region width and ensure it's within bounds
            if (drop.column >= newRegion.startColumn + newRegion.columns)
                drop.column = (drop.column % newRegion.columns) + newRegion.startColumn;
            else if (drop.column < newRegion.startColumn)
                drop.column = newRegion.startColumn;
            
            // No need to adjust Y position as it should continue naturally
            // Drops that are off-screen will be reset by the normal update cycle
        }
    }

    private _renderRainDrop(drop: RainDrop, characters: CharacterData[], _context: PatternContext): void {
        if (!this._region) return;

        for (let i = 0; i < drop.length; i++) {
            const charY = Math.floor(drop.y) - i;
            
            // Skip characters outside visible region (including padding)
            if (charY < this._region.startRow || charY > this._region.endRow) 
                continue;

            // Also check column bounds to ensure we don't render outside the region
            if (drop.column < this._region.startColumn || drop.column > this._region.endColumn)
                continue;

            const x = drop.column * this._region.charSpacingX;
            const y = charY * this._region.charSpacingY;

            // Different colors for different parts of the drop
            let color: string;
            let opacity = 1.0;

            if (i === 0) {
                // Bright head of the drop
                color = '#ffffff';
            } else if (i < 3) {
                // Bright middle section
                color = '#00ff00';
            } else {
                // Fading tail
                color = '#00ff00';
                opacity = Math.max(0.3, 1 - (i / drop.length) * 0.7);
            }

            characters.push({
                x,
                y,
                char: drop.characters[i],
                color,
                opacity,
            });
        }
    }

    public destroy(): void {
        this._rainDrops = [];
        this._lastFrameCharacters = [];
        this._region = null;
    }

    public updateOptions(newOptions: Partial<JapaneseRainPatternOptions>): void {
        super.updateOptions(newOptions);
        
        if (newOptions.rainDensity !== undefined && this._region) 
            this._maintainRainDensity();

        if (newOptions.characters !== undefined) {
            for (const drop of this._rainDrops) {
                drop.characters = Array.from(
                    { length: drop.length },
                    () => generateJapaneseCharacter(this._options.characters)
                );
            }
        }
    }
}
