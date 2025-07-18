import { createPerlinExample } from './examples/perlin';
import '../../docs/styles/common.css';
import '../../docs/styles/demo.css';
import type { ASCIIRenderer } from '../rendering/ascii-renderer';

function createControls(controls: HTMLFormElement) {
    controls.addEventListener('input', (event) => {
        console.log(event);
    });

    controls.classList.remove('hidden');
}

function removeLoader(loader: HTMLElement) {
    loader.classList.add('hidden');
}

function handleResize(renderer: ASCIIRenderer) {
    window.addEventListener('resize', () => renderer.resize(window.innerWidth, window.innerHeight));
}

function start() {
    const context = createPerlinExample();
    const loader = document.getElementById('loader') as HTMLElement;
    const controls = document.getElementById('controls') as HTMLFormElement;
    
    if (!context.canvas) {
        console.error('Canvas could not be created.');
        return;
    }

    document.body.appendChild(context.canvas);
    handleResize(context.renderer);
    createControls(controls);
    removeLoader(loader);
}

if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start);
else start();
