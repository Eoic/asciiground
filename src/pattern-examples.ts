import { PerlinNoisePattern } from './patterns/perlin-noise-pattern';
import { ASCIIRenderer } from './rendering/ascii-renderer';

/**
 * Example usage of the new pattern-based rendering API
 */
export function createPatternExample() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const pattern = new PerlinNoisePattern({
        // TODO: Remove.
        fontSize: 32,
        fontFamily: 'monospace',
        characters: ['.', '+', '#', '@'],
        backgroundColor: '#000000',
        animationSpeed: 50,
        frequency: 0.05,
        octaves: 5,
        persistence: 0.5,
        lacunarity: 2.0,
        seed: 42,
    });
    
    const renderer = new ASCIIRenderer(canvas, pattern, {
        fontSize: 32,
        fontFamily: 'monospace',
        color: '#3e3e80ff',
        backgroundColor: '#181818ff',
        rendererType: '2D',
        renderPadding: 2,
    });
    
    renderer.startAnimation();

    return {
        canvas,
        renderer,
        pattern,
    };
}

/**
 * Example of creating a pattern with mouse interaction
 */
export function createInteractiveExample() {
    const { canvas, renderer, pattern } = createPatternExample();

    return {
        canvas,
        renderer,
        pattern,
    };
}

/**
 * Example of switching between patterns
 */
export function createPatternSwitchExample() {
    const { canvas, renderer } = createPatternExample();

    const wavePattern = new PerlinNoisePattern({
        fontSize: 16,
        fontFamily: 'monospace',
        characters: ['~', '-', '=', '#', '@'],
        backgroundColor: '#000011',
        animationSpeed: 1,
        frequency: 0.05,
        octaves: 2,
        persistence: 0.8,
        lacunarity: 1.5,
        seed: 123,
    });

    setTimeout(() => renderer.setPattern(wavePattern), 5000);

    return {
        canvas,
        renderer,
        switchPattern: (pattern: PerlinNoisePattern) => renderer.setPattern(pattern),
    };
}
