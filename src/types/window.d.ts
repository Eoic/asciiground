import type { ASCIIGroundOptions } from '../index';

declare global {
    interface Window {
        switchPattern: (pattern: ASCIIGroundOptions['pattern']) => void;
        toggleAnimation: () => void;
    }
}

export {};
