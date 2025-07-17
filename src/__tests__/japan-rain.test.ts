// import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
// import { ASCIIGround, type ASCIIGroundOptions } from '../index';

// const mockRequestAnimationFrame = vi.fn();
// const mockCancelAnimationFrame = vi.fn();

// Object.assign(globalThis, {
//     requestAnimationFrame: mockRequestAnimationFrame,
//     cancelAnimationFrame: mockCancelAnimationFrame,
//     performance: {
//         now: vi.fn(() => 1000),
//     },
// });

// describe('ASCIIGround Japan Rain Pattern', () => {
//     let canvas: HTMLCanvasElement;
//     let mockContext: Partial<CanvasRenderingContext2D>;
//     let japanRainOptions: ASCIIGroundOptions;

//     beforeEach(() => {
//         vi.clearAllMocks();

//         mockRequestAnimationFrame.mockImplementation((_callback: FrameRequestCallback) => {
//             return 123;
//         });

//         canvas = document.createElement('canvas');
//         canvas.width = 400;
//         canvas.height = 300;

//         mockContext = {
//             fillStyle: '',
//             font: '',
//             textBaseline: 'top' as CanvasTextBaseline,
//             fillRect: vi.fn(),
//             fillText: vi.fn(),
//             measureText: vi.fn(() => ({ width: 12 } as TextMetrics)),
//         };

//         vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext as CanvasRenderingContext2D);

//         japanRainOptions = {
//             pattern: 'japan-rain',
//             characters: [' '], // Ignored for japan-rain pattern
//             speed: 0.07,
//             rainDensity: 0.85,
//             fontSize: 18,
//             color: '#4dfb4a',
//             backgroundColor: '#000',
//         };
//     });

//     afterEach(() => {
//         vi.restoreAllMocks();
//     });

//     describe('Japan Rain initialization', () => {
//         it('should initialize Japan Rain pattern correctly', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions);
//             expect(ascii).toBeInstanceOf(ASCIIGround);
//         });

//         it('should use default rain density when not specified', () => {
//             const optionsWithoutDensity = { ...japanRainOptions };
//             delete optionsWithoutDensity.rainDensity;
            
//             const ascii = new ASCIIGround(canvas, optionsWithoutDensity);
//             expect(ascii).toBeInstanceOf(ASCIIGround);
//         });

//         it('should handle custom rain density values', () => {
//             const testDensities = [0.1, 0.5, 0.9, 1.0];
            
//             testDensities.forEach(density => {
//                 const options = { ...japanRainOptions, rainDensity: density };
//                 const ascii = new ASCIIGround(canvas, options);
//                 expect(ascii).toBeInstanceOf(ASCIIGround);
//             });
//         });
//     });

//     describe('Japan Rain animation lifecycle', () => {
//         it('should start Japan Rain animation', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.startAnimation();
//             expect(mockRequestAnimationFrame).toHaveBeenCalled();
//             ascii.stopAnimation();
//         });

//         it('should stop Japan Rain animation', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.startAnimation();
//             ascii.stopAnimation();
//             expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123);
//         });

//         it('should prevent starting animation when already running', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.startAnimation();
//             expect(() => ascii.startAnimation()).toThrow('Animation is already running!');
//             ascii.stopAnimation();
//         });
//     });

//     describe('Japan Rain rendering', () => {
//         it('should render Japan Rain pattern without crashing', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.startAnimation();
//             expect(mockContext.fillRect).toHaveBeenCalled();
//             ascii.stopAnimation();
//         });

//         it('should handle different rain densities', () => {
//             const densities = [0.1, 0.5, 0.9];
            
//             densities.forEach(rainDensity => {
//                 const options = { ...japanRainOptions, rainDensity };
//                 const ascii = new ASCIIGround(canvas, options).init();
//                 ascii.startAnimation();
//                 expect(mockRequestAnimationFrame).toHaveBeenCalled();
//                 ascii.stopAnimation();
//                 vi.clearAllMocks();
//                 mockRequestAnimationFrame.mockImplementation((_callback: FrameRequestCallback) => 123);
//             });
//         });

//         it('should use proper colors for Japan Rain', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.startAnimation();
//             expect(mockContext.fillStyle).toBeDefined();
//             ascii.stopAnimation();
//         });
//     });

//     describe('Japan Rain configuration', () => {
//         it('should update Japan Rain options', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.updateOptions({ speed: 0.1, rainDensity: 0.7 });
//             expect(ascii).toBeInstanceOf(ASCIIGround);
//         });

//         it('should resize canvas for Japan Rain', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.resize(800, 600);
            
//             expect(canvas.width).toBe(800);
//             expect(canvas.height).toBe(600);
//         });

//         it('should handle different font sizes', () => {
//             const fontSizes = [12, 16, 20, 24];
            
//             fontSizes.forEach(fontSize => {
//                 const options = { ...japanRainOptions, fontSize };
//                 new ASCIIGround(canvas, options).init();
//                 expect(mockContext.font).toContain(`${fontSize}px`);
//             });
//         });
//     });

//     describe('Japan Rain drop management', () => {
//         it('should initialize drops correctly', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             expect(ascii).toBeInstanceOf(ASCIIGround);
//         });

//         it('should handle drop updates during animation', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.startAnimation();
//             expect(mockRequestAnimationFrame).toHaveBeenCalled();
//             ascii.stopAnimation();
//         });

//         it('should render drops with proper positioning', () => {
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.startAnimation();
//             expect(mockContext.fillText).toHaveBeenCalled();
//             ascii.stopAnimation();
//         });
//     });

//     describe('Japan Rain edge cases', () => {
//         it('should handle zero rain density', () => {
//             const options = { ...japanRainOptions, rainDensity: 0 };
//             const ascii = new ASCIIGround(canvas, options).init();
//             ascii.startAnimation();
//             expect(mockRequestAnimationFrame).toHaveBeenCalled();
//             ascii.stopAnimation();
//         });

//         it('should handle very small canvas', () => {
//             canvas.width = 10;
//             canvas.height = 10;
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.startAnimation();
//             expect(mockRequestAnimationFrame).toHaveBeenCalled();
//             ascii.stopAnimation();
//         });

//         it('should handle very large canvas', () => {
//             canvas.width = 1920;
//             canvas.height = 1080;
//             const ascii = new ASCIIGround(canvas, japanRainOptions).init();
//             ascii.startAnimation();
//             expect(mockRequestAnimationFrame).toHaveBeenCalled();
//             ascii.stopAnimation();
//         });
//     });
// });
