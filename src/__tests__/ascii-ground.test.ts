import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ASCIIGround, createFullPageBackground, type ASCIIGroundOptions } from '../index';

// Setup global mocks
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

Object.assign(globalThis, {
    requestAnimationFrame: mockRequestAnimationFrame,
    cancelAnimationFrame: mockCancelAnimationFrame,
    performance: {
        now: vi.fn(() => 1000),
    },
});

describe('ASCIIGround', () => {
    let canvas: HTMLCanvasElement;
    let mockContext: Partial<CanvasRenderingContext2D>;
    let defaultOptions: ASCIIGroundOptions;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRequestAnimationFrame.mockImplementation((_callback: FrameRequestCallback) => {
            return 123;
        });

        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;

        mockContext = {
            fillStyle: '',
            font: '',
            textBaseline: 'top' as CanvasTextBaseline,
            fillRect: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn(() => ({ width: 10 } as TextMetrics)),
        };

        vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext as CanvasRenderingContext2D);

        defaultOptions = {
            pattern: 'perlin',
            characters: ['.', ':', ';', '+', '*', '#'],
            speed: 0.01,
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create ASCIIGround instance with default options', () => {
            const ascii = new ASCIIGround(canvas, defaultOptions);
            expect(ascii).toBeInstanceOf(ASCIIGround);
        });

        it('should throw error if canvas context is not available', () => {
            vi.spyOn(canvas, 'getContext').mockReturnValue(null);
            expect(() => new ASCIIGround(canvas, defaultOptions)).toThrow('Could not get 2D context from the canvas.');
        });

        it('should use default values for optional options', () => {
            new ASCIIGround(canvas, defaultOptions).init();
            expect(mockContext.font).toBe('12px monospace');
            expect(mockContext.textBaseline).toBe('top');
        });

        it('should use custom options when provided', () => {
            const customOptions: ASCIIGroundOptions = {
                ...defaultOptions,
                fontSize: 16,
                fontFamily: 'courier',
                color: '#ff0000',
                backgroundColor: '#ffffff',
            };

            new ASCIIGround(canvas, customOptions).init();
            expect(mockContext.font).toBe('16px courier');
        });
    });

    describe('start and stop methods', () => {
        it('should start animation', () => {
            const ascii = new ASCIIGround(canvas, defaultOptions).init();
            ascii.startAnimation();
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });

        it('should not start animation if already running', () => {
            const ascii = new ASCIIGround(canvas, defaultOptions).init();
            ascii.startAnimation();
            mockRequestAnimationFrame.mockClear();
            expect(() => ascii.startAnimation()).toThrow('Animation is already running!');
        });

        it('should stop animation', () => {
            const ascii = new ASCIIGround(canvas, defaultOptions).init();
            ascii.startAnimation();
            ascii.stopAnimation();
            expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123);
        });
    });

    describe('updateOptions method', () => {
        it('should update options', () => {
            const ascii = new ASCIIGround(canvas, defaultOptions).init();
            ascii.updateOptions({ speed: 0.05 });
            expect(mockContext.measureText).toHaveBeenCalledWith('M');
        });
    });

    describe('resize method', () => {
        it('should resize canvas and recalculate grid', () => {
            const ascii = new ASCIIGround(canvas, defaultOptions).init();
            ascii.resize(1000, 800);
            expect(canvas.width).toBe(1000);
            expect(canvas.height).toBe(800);
        });
    });

    describe('animation patterns', () => {
        it('should handle perlin pattern', () => {
            const ascii = new ASCIIGround(canvas, { ...defaultOptions, pattern: 'perlin' }).init();
            ascii.startAnimation();
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });

        it('should handle wave pattern', () => {
            const ascii = new ASCIIGround(canvas, { ...defaultOptions, pattern: 'wave' }).init();
            ascii.startAnimation();
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });

        it('should handle rain pattern', () => {
            const ascii = new ASCIIGround(canvas, { ...defaultOptions, pattern: 'rain' }).init();
            ascii.startAnimation();
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });

        it('should handle static pattern', () => {
            const ascii = new ASCIIGround(canvas, { ...defaultOptions, pattern: 'static' }).init();
            ascii.startAnimation();
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('rendering and animation', () => {
        it('should call render methods when animation starts', () => {
            const ascii = new ASCIIGround(canvas, defaultOptions).init();
            ascii.startAnimation();
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });

        it('should handle different canvas sizes', () => {
            const testSizes = [
                { width: 100, height: 100 },
                { width: 1920, height: 1080 },
                { width: 50, height: 200 }
            ];

            testSizes.forEach(({ width, height }) => {
                canvas.width = width;
                canvas.height = height;
                const ascii = new ASCIIGround(canvas, defaultOptions).init();
                expect(ascii).toBeInstanceOf(ASCIIGround);
            });
        });

        it('should handle edge case with empty character array', () => {
            const options: ASCIIGroundOptions = {
                ...defaultOptions,
                characters: [],
            };

            const ascii = new ASCIIGround(canvas, options).init();
            expect(ascii).toBeInstanceOf(ASCIIGround);
        });
    });
});

describe('createFullPageBackground', () => {
    let mockCanvas: HTMLCanvasElement;
    let mockContext: Partial<CanvasRenderingContext2D>;

    beforeEach(() => {
        mockCanvas = document.createElement('canvas');

        mockContext = {
            fillStyle: '',
            font: '',
            textBaseline: 'top' as CanvasTextBaseline,
            fillRect: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn(() => ({ width: 10 } as TextMetrics)),
        };

        vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext as CanvasRenderingContext2D);
        vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockCanvas);
        
        Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create full page background', () => {
        const options: ASCIIGroundOptions = {
            pattern: 'perlin',
            characters: ['.', ':', ';', '+', '*', '#'],
            speed: 0.01,
        };

        const ascii = createFullPageBackground(options).init();
        expect(ascii).toBeInstanceOf(ASCIIGround);
        expect(mockCanvas).toBeDefined();
    });

    it('should set up canvas styles correctly', () => {
        const options: ASCIIGroundOptions = {
            pattern: 'wave',
            characters: ['~', '-', '=', '#'],
            speed: 0.02,
        };

        createFullPageBackground(options);
        expect(mockCanvas.style.position).toBe('fixed');
        expect(mockCanvas.style.top).toBe('0px');
        expect(mockCanvas.style.left).toBe('0px');
        expect(mockCanvas.style.width).toBe('100%');
        expect(mockCanvas.style.height).toBe('100%');
        expect(mockCanvas.style.zIndex).toBe('-1');
        expect(mockCanvas.style.pointerEvents).toBe('none');
    });

    it('should handle window resize events', () => {
        const options: ASCIIGroundOptions = {
            pattern: 'static',
            characters: [' ', '.', '*', '#'],
            speed: 0.1,
        };

        createFullPageBackground(options);
        Object.defineProperty(window, 'innerWidth', { value: 1600, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 900, writable: true });
    
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
        expect(mockCanvas.width).toBe(1600);
        expect(mockCanvas.height).toBe(900);
    });
});
