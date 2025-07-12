// Matrix rain effect example.
import { createFullPageBackground, ASCIIGround } from '../src/index';

export function createMatrixRain() {
    return createFullPageBackground({
        pattern: 'rain',
        characters: ['0', '1', '|', '!', ':', '.', ' '],
        speed: 0.05,
        color: '#00ff00',
        backgroundColor: '#000000',
        fontSize: 14,
        animated: true,
    });
}

// Cyberpunk waves example.
export function createCyberpunkWaves(canvas: HTMLCanvasElement) {
    return new ASCIIGround(canvas, {
        pattern: 'wave',
        characters: [' ', '░', '▒', '▓', '█'],
        speed: 0.03,
        color: '#ff00ff',
        backgroundColor: '#1a0a1a',
        fontSize: 16,
        animated: true,
    });
}

// Perlin noise cloud example.
export function createPerlinClouds(canvas: HTMLCanvasElement) {
    return new ASCIIGround(canvas, {
        pattern: 'perlin',
        characters: [' ', '.', ':', ';', '+', '*', '#', '@'],
        speed: 0.008,
        color: '#87ceeb',
        backgroundColor: '#191970',
        fontSize: 10,
        animated: true,
    });
}

// Static TV effect example.
export function createTVStatic(canvas: HTMLCanvasElement) {
    return new ASCIIGround(canvas, {
        pattern: 'static',
        characters: [' ', '.', '*', '#'],
        speed: 0.1,
        color: '#ffffff',
        backgroundColor: '#000000',
        fontSize: 8,
        animated: true,
    });
}
