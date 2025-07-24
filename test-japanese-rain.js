// Test script for Japanese Rain Pattern debugging
import { JapaneseRainPattern } from './src/patterns/japanese-rain-pattern.js';

// Create a simple test region
const testRegion = {
    rows: 10,
    columns: 10,
    startRow: 0,
    endRow: 10,
    startColumn: 0,
    endColumn: 10,
    charWidth: 12,
    charHeight: 16,
    charSpacingX: 12,
    charSpacingY: 16,
    canvasWidth: 120,
    canvasHeight: 160,
};

// Create pattern with default options
const pattern = new JapaneseRainPattern({
    rainDensity: 0.8,
    minDropLength: 3,
    maxDropLength: 8,
    minSpeed: 0.5,
    maxSpeed: 1.5,
    mutationRate: 0.04,
    fadeOpacity: 0.2,
    animationSpeed: 1,
    characters: ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ']
});

// Initialize the pattern
pattern.initialize(testRegion);

// Test pattern context
const context = {
    time: 0,
    deltaTime: 0.016, // ~60fps
    animationTime: 0,
    region: testRegion,
    isAnimating: true,
};

console.log('Pattern ID:', pattern.constructor.ID);
console.log('Pattern Options:', pattern.options);

// Update and generate characters
pattern.update(context);
const characters = pattern.generate(context);

console.log('Generated characters:', characters.length);
console.log('Sample characters:', characters.slice(0, 5));

if (characters.length === 0) {
    console.error('No characters generated! This indicates an issue.');
} else {
    console.log('Pattern is working correctly!');
}
