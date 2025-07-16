import { ASCIIGround, type ASCIIGroundOptions } from '../index.js';
import '../../docs/styles/common.css';
import '../../docs/styles/demo.css';

let asciiGround: ASCIIGround | null = null;

function initDemo() {
    const canvas = document.getElementById('background-canvas') as HTMLCanvasElement;
    const loading = document.getElementById('loading') as HTMLElement;
    const controls = document.getElementById('controls') as HTMLElement;
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (asciiGround)
            asciiGround.resize(canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function getOptionsFromControls(): ASCIIGroundOptions {
        const pattern = (document.getElementById('pattern') as HTMLSelectElement).value as 
            'perlin' | 'wave' | 'rain' | 'static' | 'japan-rain';
        const charactersInput = (document.getElementById('characters') as HTMLInputElement).value;
        const characters = charactersInput.split(',').map(c => c.trim());
        const speed = parseFloat((document.getElementById('speed') as HTMLInputElement).value);
        const fontSize = parseInt((document.getElementById('fontSize') as HTMLInputElement).value);
        const fontFamily = (document.getElementById('fontFamily') as HTMLInputElement).value;
        const color = (document.getElementById('color') as HTMLInputElement).value;
        const backgroundColor = (document.getElementById('backgroundColor') as HTMLInputElement).value;
        const direction = (document.getElementById('direction') as HTMLSelectElement).value as 
            'up' | 'down' | 'left' | 'right';
        const amplitudeX = parseFloat((document.getElementById('amplitudeX') as HTMLInputElement).value);
        const amplitudeY = parseFloat((document.getElementById('amplitudeY') as HTMLInputElement).value);
        const frequency = parseFloat((document.getElementById('frequency') as HTMLInputElement).value);
        const noiseScale = parseFloat((document.getElementById('noiseScale') as HTMLInputElement).value);
        const rainDensity = parseFloat((document.getElementById('rainDensity') as HTMLInputElement).value);
        const rainDirection = (document.getElementById('rainDirection') as HTMLSelectElement).value as 
            'vertical' | 'diagonal-left' | 'diagonal-right';

        return {
            pattern,
            characters,
            speed,
            fontSize,
            fontFamily,
            color,
            backgroundColor,
            direction,
            amplitudeX,
            amplitudeY,
            frequency,
            noiseScale,
            rainDensity,
            rainDirection,
        };
    }

    const options = getOptionsFromControls();
    asciiGround = new ASCIIGround(canvas, options);
    asciiGround.init();

    loading.style.display = 'none';
    controls.classList.remove('hidden');
    asciiGround.startAnimation();

    function updateASCIIGround() {
        if (asciiGround) {
            const newOptions = getOptionsFromControls();
            asciiGround.updateOptions(newOptions);
        }
    }

    const formControls = controls.querySelectorAll('input, select');

    formControls.forEach(control => {
        control.addEventListener('change', updateASCIIGround);
        control.addEventListener('input', updateASCIIGround);
    });

    const toggleBtn = document.getElementById('toggleBtn') as HTMLInputElement;

    toggleBtn.addEventListener('change', () => {
        if (asciiGround) {
            if (toggleBtn.checked)
                asciiGround.startAnimation();
            else asciiGround.stopAnimation();
        }
    });
}

if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initDemo);
else initDemo();
