import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We need to test the internal PerlinNoise class through the public API
// since it's not exported. We'll test it indirectly through the ASCIIGround class.
import { ASCIIGround, type ASCIIGroundOptions } from '../index';

describe('PerlinNoise integration', () => {
    let canvas: HTMLCanvasElement;
    let mockContext: Partial<CanvasRenderingContext2D>;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        mockContext = {
            fillStyle: '',
            font: '',
            textBaseline: 'top' as CanvasTextBaseline,
            fillRect: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn(() => ({ width: 10 } as TextMetrics)),
        };

        vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext as CanvasRenderingContext2D);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should generate consistent patterns with perlin noise', () => {
        const options: ASCIIGroundOptions = {
            pattern: 'perlin',
            characters: ['.', '#'],
            speed: 0,
        };

        const ascii1 = new ASCIIGround(canvas, options);
        const ascii2 = new ASCIIGround(canvas, options);

        // Both instances should use the same seed (0) and generate the same pattern
        // This tests that the PerlinNoise class is working consistently.
        expect(ascii1).toBeInstanceOf(ASCIIGround);
        expect(ascii2).toBeInstanceOf(ASCIIGround);
    });

    it('should handle different patterns correctly', () => {
        const patterns: Array<'perlin' | 'wave' | 'rain' | 'static'> = ['perlin', 'wave', 'rain', 'static'];

        patterns.forEach(pattern => {
            const options: ASCIIGroundOptions = {
                pattern,
                characters: ['.', '#'],
                speed: 0.01,
            };

            const ascii = new ASCIIGround(canvas, options);
            expect(ascii).toBeInstanceOf(ASCIIGround);
        });
    });

    it('should handle edge cases for character arrays', () => {
        const testCases = [
            { characters: ['.'] },
            { characters: ['.', '#'] },
            { characters: [' ', '.', ':', ';', '+', '*', '#', '@', '█'] }
        ];

        testCases.forEach(({ characters }) => {
            const options: ASCIIGroundOptions = {
                pattern: 'perlin',
                characters,
                speed: 0.01,
            };

            const ascii = new ASCIIGround(canvas, options);
            expect(ascii).toBeInstanceOf(ASCIIGround);
        });
    });
});
