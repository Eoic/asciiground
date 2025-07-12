import './style.css';
import { ASCIIGround, type ASCIIGroundOptions } from './index.ts';

const canvas = document.querySelector<HTMLCanvasElement>('#demo-canvas')!;

const ascii = new ASCIIGround(canvas, {
    pattern: 'perlin',
    characters: ['.', ':', ';', '+', '*', '#'],
    speed: 0.01,
});

window.switchPattern = (pattern: ASCIIGroundOptions['pattern']) => {
    ascii.updateOptions({ pattern });
};

window.toggleAnimation = function () {
    if (ascii.isAnimating) 
        ascii.stop();
    else ascii.start();
};

ascii.start();
