import type { ASCIIGroundOptions } from '../index';

declare global {
    interface Window {
        switchPattern: (
            pattern: ASCIIGroundOptions['pattern'],
            extraOptions?: Partial<ASCIIGroundOptions>
        ) => void;
        setASCIIGroundOptions: (opts: Partial<ASCIIGroundOptions>) => void;
        toggleAnimation: () => void;
        resizeASCII: () => void;
    }
}

export {};
