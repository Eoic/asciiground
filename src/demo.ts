import './style.css';
import { ASCIIGround, type ASCIIGroundOptions } from './index.ts';

const canvas = document.querySelector<HTMLCanvasElement>('#demo-canvas')!;

const ascii = new ASCIIGround(canvas, {
    pattern: 'perlin',
    characters: ['.', ':', ';', '+', '*', '#'],
    speed: 0.01,
    direction: 'down',
    noiseScale: 0.1,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#00ff00',
    backgroundColor: '#000000',
    amplitudeX: 1,
    amplitudeY: 1,
    frequency: 1,
    rainDensity: 0.9,
    rainDirection: 'vertical',
    animated: true,
});

window.switchPattern = (
    pattern: ASCIIGroundOptions['pattern'],
    extraOptions?: Partial<ASCIIGroundOptions>
) => {
    ascii.updateOptions({
        pattern,
        ...extraOptions
    });
};

window.setASCIIGroundOptions = (opts: Partial<ASCIIGroundOptions>) => {
    ascii.updateOptions(opts);
};

window.toggleAnimation = function () {
    if (ascii.isAnimating) 
        ascii.stop();
    else ascii.start();
};

window.resizeASCII = function () {
    ascii.resize(canvas.clientWidth, canvas.clientHeight);
};

ascii.start();