import type { ASCIIGroundOptions } from '../index';

declare global {
    interface Window {
        resizeASCII: () => void;
        toggleAnimation: () => void;
        setASCIIGroundOptions: (opts: Partial<ASCIIGroundOptions>) => void;
        switchPattern: (pattern: ASCIIGroundOptions['pattern'], extraOptions?: Partial<ASCIIGroundOptions>) => void;
    }
}

export {};
