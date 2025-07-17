// Simple test to demonstrate the new Perlin noise implementation
import { PerlinNoisePattern } from './src/patterns/perlin-noise-pattern.js';

// Create a Perlin noise pattern
const pattern = new PerlinNoisePattern({
    fontSize: 12,
    fontFamily: 'monospace',
    characters: [' ', '.', ':', ';', '+', '*', '#', '@', '█'],
    backgroundColor: '#000000',
    animationSpeed: 1,
    frequency: 0.02,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    seed: 42
});

// Test the noise function
console.log('Testing Perlin noise pattern...');

// Generate some sample values
const noiseFunc = pattern._getNoiseFunction('down');
const samples = [];

for (let y = 0; y < 10; y++) {
    const row = [];
    for (let x = 0; x < 20; x++) {
        const noise = noiseFunc(x, y, 0);
        // Map noise value to character index
        const charIndex = Math.floor((noise + 1) * 0.5 * (pattern.options.characters.length - 1));
        row.push(pattern.options.characters[Math.max(0, Math.min(charIndex, pattern.options.characters.length - 1))]);
    }
    samples.push(row.join(''));
}

console.log('Sample noise pattern:');
samples.forEach(row => console.log(row));

console.log('\nAnimated noise (time = 10):');
const animatedSamples = [];
for (let y = 0; y < 10; y++) {
    const row = [];
    for (let x = 0; x < 20; x++) {
        const noise = noiseFunc(x, y, 10);
        const charIndex = Math.floor((noise + 1) * 0.5 * (pattern.options.characters.length - 1));
        row.push(pattern.options.characters[Math.max(0, Math.min(charIndex, pattern.options.characters.length - 1))]);
    }
    animatedSamples.push(row.join(''));
}
animatedSamples.forEach(row => console.log(row));
