import type { Pattern } from './patterns/pattern';
import { ASCIIRenderer, type ASCIIRendererOptions } from './rendering/ascii-renderer';

export class ASCIIGround {
    private _renderer: ASCIIRenderer | null = null;

    public init(
        canvas: HTMLCanvasElement,
        pattern?: Pattern,
        options?: Partial<ASCIIRendererOptions>
    ): ASCIIGround {
        this._renderer = new ASCIIRenderer(canvas, pattern, options);
        return this;
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
        this._renderer!.pattern = pattern;
        return this;
    }

    public setOptions(options: Partial<ASCIIRendererOptions>): ASCIIGround {
        this._renderer!.setOptions(options);
        return this;
    }

    public destroy(): void {
        this._renderer?.destroy();
        this._renderer = null;
    }
}

export default ASCIIGround;
