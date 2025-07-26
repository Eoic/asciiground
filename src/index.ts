import type { Pattern } from './patterns/pattern';
import { ASCIIRenderer, type ASCIIRendererOptions } from './rendering/ascii-renderer';

export class ASCIIGround {
    private _renderer: ASCIIRenderer | null = null;

    constructor(
        canvas: HTMLCanvasElement,
        pattern: Pattern,
        options: Partial<ASCIIRendererOptions> = {}
    ) {
        this._renderer = new ASCIIRenderer(canvas, pattern, options);
    }

    public startAnimation(): ASCIIGround {
        this._renderer?.startAnimation();
        return this;
    }

    public stopAnimation(): ASCIIGround {
        this._renderer?.stopAnimation();
        return this;
    }

    public setPattern(pattern: Pattern): ASCIIGround {
        if (!this._renderer) 
            throw new Error('Renderer is not initialized');

        this._renderer.pattern = pattern;
        return this;
    }

    public setOptions(options: Partial<ASCIIRendererOptions>): ASCIIGround {
        if (!this._renderer) 
            throw new Error('Renderer is not initialized');

        this._renderer.setOptions(options);
        return this;
    }

    public destroy(): void {
        this._renderer?.destroy();
        this._renderer = null;
    }
}

export default ASCIIGround;
