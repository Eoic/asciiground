# ASCIIGround

[![CI/CD Pipeline](https://github.com/Eoic/asciiground/actions/workflows/ci-cd.yml/badge.svg?branch=master)](https://github.com/Eoic/asciiground/actions)
[![codecov](https://codecov.io/gh/Eoic/asciiground/graph/badge.svg?token=4M6ADHLZ4F)](https://codecov.io/gh/Eoic/asciiground)
[![npm version](https://img.shields.io/npm/v/asciiground.svg?style=flat)](https://www.npmjs.com/package/asciiground)
[![unpkg](https://img.shields.io/npm/v/asciiground?label=unpkg&color=blue)](https://unpkg.com/asciiground@latest/dist/)
[![](https://data.jsdelivr.com/v1/package/npm/asciiground/badge)](https://www.jsdelivr.com/package/npm/asciiground)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A JS library for creating animated ASCII backgrounds.

## Features

- Multiple animation patterns: **Perlin noise**, **waves**, **rain**, **static**, **japan-rain** (Japanese matrix rain).
- Configuration options for animation speed, direction, density, character sets, wave/Perlin/rain parameters, and more.
- Responsive and resizable.
- Utility function for full-page backgrounds.
- Customizable font, color, and background.
- Supports both ESM and UMD/CDN usage.

## Installation

### NPM

```bash
npm install asciiground
```

### CDN

```html
<script src="https://unpkg.com/asciiground@latest/dist/asciiground.umd.js"></script>
```

## Quick start

### Basic usage

```typescript
import { ASCIIGround } from 'asciiground'

// Acquire canvas element.
const canvas = document.getElementById('my-canvas') as HTMLCanvasElement

// Create background renderer.
const asciiGround = new ASCIIGround(canvas, {
  pattern: 'perlin',
  characters: ['.', ':', ';', '+', '*', '#'],
  speed: 0.01
})

// Render background on the canvas.
asciiGround.start()
```

### Full page background

```typescript
import { createFullPageBackground } from 'asciiground'

// Create a full-page ASCII background.
const background = createFullPageBackground({
  pattern: 'wave',
  characters: [' ', '.', ':', ';', '+', '*', '#', '@'],
  speed: 0.02,
  color: '#00ff00',
  backgroundColor: '#000000'
})

background.start()
```

### CDN usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>ASCIIGround demo</title>
</head>
<body>
    <canvas id="ascii-canvas" width="800" height="600"></canvas>
    <script src="https://unpkg.com/asciiground@latest/dist/asciiground.umd.js"></script>
    <script>
        const canvas = document.getElementById('ascii-canvas')

        const ascii = new ASCIIGround.default(canvas, {
            pattern: 'perlin',
            characters: ['.', ':', ';', '+', '*', '#'],
            speed: 0.01
        })

        ascii.start()
    </script>
</body>
</html>
```

## API reference

### ASCIIGroundOptions

| Property         | Type                                                                           | Default         | Description                                                    |
|------------------|--------------------------------------------------------------------------------|-----------------|----------------------------------------------------------------|
| `pattern`        | `'perlin' \| 'wave' \| 'rain' \| 'static' \| 'japan-rain'`                     | Required        | Animation pattern type                                         |
| `characters`     | `string[]`                                                                     | Required        | ASCII characters from lightest to darkest                      |
| `speed`          | `number`                                                                       | Required        | Animation speed multiplier                                     |
| `animated`       | `boolean`                                                                      | `true`          | Whether the background is animated                             |
| `fontSize`       | `number`                                                                       | `12`            | Font size in pixels                                            |
| `fontFamily`     | `string`                                                                       | `'monospace'`   | Font family                                                    |
| `color`          | `string`                                                                       | `'#00ff00'`     | Text color                                                     |
| `backgroundColor`| `string`                                                                       | `'#000000'`     | Background color                                               |
| `direction`      | `'left' \| 'right' \| 'up' \| 'down'`                                          | `'down'`        | Animation direction (Perlin/Wave)                              |
| `amplitudeX`     | `number`                                                                       | `1`             | Horizontal amplitude (wave)                                    |
| `amplitudeY`     | `number`                                                                       | `1`             | Vertical amplitude (wave)                                      |
| `frequency`      | `number`                                                                       | `1`             | Frequency for wave pattern                                     |
| `noiseScale`     | `number`                                                                       | `0.1`           | Scale for Perlin noise pattern                                 |
| `rainDensity`    | `number` (0-1)                                                                 | `0.9`           | Density of rain drops (rain/japan-rain)                        |
| `rainDirection`  | `'vertical' \| 'diagonal-left' \| 'diagonal-right'`                            | `'vertical'`    | Direction of rain (rain)                                       |

### ASCIIGround methods

#### `start(): void`
Starts the animation loop.

#### `stop(): void`
Stops the animation loop.

#### `updateOptions(options: Partial<ASCIIGroundOptions>): void`
Updates animation options dynamically.

#### `resize(width: number, height: number): void`
Resizes the canvas and recalculates the character grid.

#### `isAnimating: boolean`
Returns `true` if the animation is currently running.

### Utility functions

#### `createFullPageBackground(options: ASCIIGroundOptions): ASCIIGround`
Creates a full-page background canvas with automatic resizing.

## Animation patterns

### Perlin noise
Creates smooth, organic-looking patterns like clouds, terrain or flowing effects.

```typescript
{
  pattern: 'perlin',
  characters: [' ', '.', ':', ';', '+', '*', '#', '@'],
  speed: 0.01,
  direction: 'down', // Optional: 'left' | 'right' | 'up' | 'down'
  noiseScale: 0.08
}
```

### Wave
Generates sine wave patterns that flow across the screen.

```typescript
{
  pattern: 'wave',
  characters: ['~', '-', '=', '#'],
  speed: 0.02,
  amplitudeX: 2,
  amplitudeY: 1,
  frequency: 1.2,
  direction: 'right'
}
```

### Rain
Creates a downward flowing effect reminiscent of digital rain.

```typescript
{
  pattern: 'rain',
  characters: ['|', '!', '1', ':'],
  speed: 0.05,
  rainDensity: 0.8,
  rainDirection: 'vertical' // or 'diagonal-left', 'diagonal-right'
}
```

### Static
Random noise effect for TV static or glitch aesthetics.

```typescript
{
  pattern: 'static',
  characters: [' ', '.', '*', '#'],
  speed: 0.1
}
```

### Japan Rain
Japanese-style Matrix rain using random Katakana, Hiragana, and Kanji.

```typescript
{
  pattern: 'japan-rain',
  characters: [' '], // Ignored, uses Japanese chars internally
  speed: 0.07,
  rainDensity: 0.85,
  fontSize: 18,
  color: '#4dfb4a',
  backgroundColor: '#000'
}
```

## Examples

### Matrix-style Japan Rain

```typescript
import { createFullPageBackground } from 'asciiground'

const matrix = createFullPageBackground({
  pattern: 'japan-rain',
  speed: 0.06,
  rainDensity: 0.92,
  fontSize: 18,
  color: '#4dfb4a',
  backgroundColor: '#000'
})

matrix.start()
```

### Classic Matrix Rain

```typescript
import { createFullPageBackground } from 'asciiground'

const matrix = createFullPageBackground({
  pattern: 'rain',
  characters: ['0', '1', '|', '!', ':', '.', ' '],
  speed: 0.05,
  color: '#00ff00',
  backgroundColor: '#000000',
  fontSize: 14,
  rainDensity: 0.9
})

matrix.start()
```

### Cyberpunk waves

```typescript
const cyberpunk = new ASCIIGround(canvas, {
  pattern: 'wave',
  characters: [' ', '░', '▒', '▓', '█'],
  speed: 0.03,
  color: '#ff00ff',
  backgroundColor: '#1a0a1a',
  amplitudeX: 2,
  amplitudeY: 1.5,
  frequency: 1.1
})
```

## Development

### Setup

```bash
git clone https://github.com/Eoic/asciiground.git
cd asciiground
npm install
```

### Development server

```bash
npm run dev
```

### Build library

```bash
npm run build
```

### Type checking

```bash
npm run typecheck
```

### Testing

```bash
npm run test:watch     # Run tests in watch mode.
npm run test:run       # Run tests once.
npm run test:coverage  # Generate coverage report.
```

### Publishing

This project uses automated publishing via GitHub Actions. See [PUBLISHING.md](./PUBLISHING.md) for detailed setup instructions.

```bash
npm run publish:patch  # 1.0.0 → 1.0.1.
npm run publish:minor  # 1.0.0 → 1.1.0.
npm run publish:major  # 1.0.0 → 2.0.0.
```

### Validate setup

Before first publish, run the setup validation:

```bash
./scripts/test-setup.sh
```

This checks all required files, configurations, and build processes.

### Development workflow
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make your changes and add tests.
4. Run the test suite: `npm run test:run`.
5. Run type checking: `npm run typecheck`.
6. Run linting: `npm run lint`.
7. Commit your changes: `npm run commit` and follow the prompts.
8. Push to the branch: `git push origin feature/your-feature`.
9. Create a Pull Request.

### Repository setup (for maintainers)

Before pushing to production, ensure these secrets are configured in GitHub:

1. **NPM_TOKEN** - required for automated NPM publishing:
   - Go to [npmjs.com](https://npmjs.com) → Account → Access Tokens.
   - Create "Automation" token with "Publish" permissions.
   - Add to GitHub from Settings → Secrets and variables → Actions.

2. **GitHub Pages** - required for CDN deployment:
   - Go to repository Settings → Pages.
   - Set "Source" to "GitHub Actions".

3. **Codecov** (optional) - for coverage reporting:
   - Connect repository at [codecov.io](https://codecov.io).
   - Add `CODECOV_TOKEN` to repository secrets.

See [PUBLISHING.md](./PUBLISHING.md) for complete setup instructions.

### Pre-push checklist

Before pushing to the remote repository:

- [ ] All tests pass: `npm run test:run`.
- [ ] Code builds successfully: `npm run build`.
- [ ] Type checking passes: `npm run typecheck`.
- [ ] Linting passes: `npm run lint`.
- [ ] Setup validation passes: `./scripts/test-setup.sh`.
- [ ] Documentation is up to date.
- [ ] `NPM_TOKEN` secret is configured in GitHub (for publishing).
- [ ] GitHub Pages is enabled (for CDN deployment).