import { createFullPageBackground, ASCIIGround } from '../src/index';

// All options included for each preset, using explicit defaults.

export function createMatrixRain() {
    return createFullPageBackground({
        pattern: 'rain',
        characters: ['0', '1', '|', '!', ':', '.', ' '],
        speed: 0.05,
        animated: true,
        fontSize: 14,
        fontFamily: 'monospace',
        color: '#00ff00',
        backgroundColor: '#000000',
        direction: 'down',
        amplitudeX: 1,
        amplitudeY: 1,
        frequency: 1,
        noiseScale: 0.1,
        rainDensity: 0.95,
        rainDirection: 'vertical'
    });
}

export function createCyberpunkWaves(canvas: HTMLCanvasElement) {
    return new ASCIIGround(canvas, {
        pattern: 'wave',
        characters: [' ', '░', '▒', '▓', '█'],
        speed: 0.03,
        animated: true,
        fontSize: 16,
        fontFamily: 'monospace',
        color: '#ff00ff',
        backgroundColor: '#1a0a1a',
        direction: 'right',
        amplitudeX: 1,
        amplitudeY: 1,
        frequency: 1.5,
        noiseScale: 0.1,
        rainDensity: 0.9,
        rainDirection: 'vertical'
    });
}

export function createPerlinClouds(canvas: HTMLCanvasElement) {
    return new ASCIIGround(canvas, {
        pattern: 'perlin',
        characters: [' ', '.', ':', ';', '+', '*', '#', '@'],
        speed: 0.008,
        animated: true,
        fontSize: 10,
        fontFamily: 'monospace',
        color: '#87ceeb',
        backgroundColor: '#191970',
        direction: 'down',
        amplitudeX: 1,
        amplitudeY: 1,
        frequency: 1,
        noiseScale: 0.08,
        rainDensity: 0.9,
        rainDirection: 'vertical'
    });
}

export function createTVStatic(canvas: HTMLCanvasElement) {
    return new ASCIIGround(canvas, {
        pattern: 'static',
        characters: [' ', '.', '*', '#'],
        speed: 0.1,
        animated: true,
        fontSize: 8,
        fontFamily: 'monospace',
        color: '#ffffff',
        backgroundColor: '#000000',
        direction: 'down',
        amplitudeX: 1,
        amplitudeY: 1,
        frequency: 1,
        noiseScale: 0.1,
        rainDensity: 0.9,
        rainDirection: 'vertical'
    });
}

export function createJapanRain() {
    return createFullPageBackground({
        pattern: 'japan-rain',
        characters: ['ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ', 'ワ', 'ン', 'ミ', 'キ', 'シ', 'ヒ', 'ニ', 'リ', 'ジ', 'ギ', 'ゾ', 'ダ', 'バ', 'パ', 'ョ', 'ュ', 'ョ'],
        speed: 0.06,
        animated: true,
        fontSize: 18,
        fontFamily: 'monospace',
        color: '#00ff99',
        backgroundColor: '#000000'
    });
}