import '../../docs/styles/common.css';
import '../../docs/styles/demo.css';
import { createPerlinExample } from './examples/perlin';
import { createPatternControls } from './ui/config-generator';
import type { ASCIIRenderer } from '../rendering/ascii-renderer';

(() => {
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
        handleControls(controls, context.renderer);
        removeLoader(loader);
    }

    function handleResize(renderer: ASCIIRenderer) {
        window.addEventListener('resize', () => renderer.resize(window.innerWidth, window.innerHeight));
    }

    function handleControls(controls: HTMLFormElement, renderer: ASCIIRenderer) {
        const controlsManager = createPatternControls(controls, renderer);
        controls.classList.remove('hidden');

        controlsManager.onControlChange('pattern', (value) => {
            console.log(`Pattern changed to: ${value}.`);
        });

        window.controlsManager = controlsManager;
    }

    function removeLoader(loader: HTMLElement) {
        loader.classList.add('hidden');
    }

    document.addEventListener('DOMContentLoaded', start);
})();
