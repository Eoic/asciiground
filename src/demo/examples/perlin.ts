import { PerlinNoisePattern } from '../../patterns/perlin-noise-pattern';
import { ASCIIRenderer } from '../../rendering/ascii-renderer';

/**
 * Example usage of the new pattern-based rendering API
 */
export function createPerlinExample() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pattern = new PerlinNoisePattern({
        characters: ['.', '+', '#', '@'],
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
 * Example of switching between patterns.
 */
// export function createPerlinSwitchExample() {
//     const { canvas, renderer } = createPerlinExample();

//     const noisePattern = new PerlinNoisePattern({
//         characters: ['.', '+', '#', '@'],
//         animationSpeed: 50,
//         frequency: 0.05,
//         octaves: 5,
//         persistence: 0.5,
//         lacunarity: 2.0,
//         seed: 42,
//     });

//     const wavePattern = new PerlinNoisePattern({
//         characters: ['~', '-', '=', '#', '@'],
//         animationSpeed: 1,
//         frequency: 0.05,
//         octaves: 2,
//         persistence: 0.8,
//         lacunarity: 1.5,
//         seed: 123,
//     });

//     let currentPatternIndex = 0;
//     const patterns = [noisePattern, wavePattern];

//     setInterval(() => {
//         currentPatternIndex = (currentPatternIndex + 1) % patterns.length;
//         renderer.setPattern(patterns[currentPatternIndex]);
//     }, 1000);

//     return {
//         canvas,
//         renderer,
//         switchPattern: (pattern: PerlinNoisePattern) => renderer.setPattern(pattern),
//     };
// }
