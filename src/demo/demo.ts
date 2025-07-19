import '../../docs/styles/common.css';
import '../../docs/styles/demo.css';
import { createPatternControls } from './ui/config-generator';
import { ASCIIRenderer } from '../rendering/ascii-renderer';
import { DummyPattern } from '../patterns/dummy-pattern';

(() => {
    function start() {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const renderer = new ASCIIRenderer(canvas, new DummyPattern());
        const loader = document.getElementById('loader') as HTMLElement;
        const controls = document.getElementById('controls') as HTMLFormElement;

        document.body.appendChild(canvas);
        handleControls(controls, renderer);
        handleResize(renderer);
        startAnimation(renderer);
        removeLoader(loader);
    }

    function handleResize(renderer: ASCIIRenderer) {
        window.addEventListener('resize', () => renderer.resize(window.innerWidth, window.innerHeight));
    }

    function handleControls(controls: HTMLFormElement, renderer: ASCIIRenderer) {
        const controlsManager = createPatternControls(controls, renderer);
        controls.classList.remove('hidden');
        window.controlsManager = controlsManager;
    }

    function startAnimation(renderer: ASCIIRenderer) {
        renderer.startAnimation();
    }

    function removeLoader(loader: HTMLElement) {
        loader.classList.add('hidden');
    }

    document.addEventListener('DOMContentLoaded', start);
})();
