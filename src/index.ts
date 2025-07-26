import type { Pattern } from './patterns/pattern';
import { ASCIIRenderer, type ASCIIRendererOptions } from './rendering/ascii-renderer';

export class ASCIIGround {
    private _renderer: ASCIIRenderer | null = null;

    private get renderer(): ASCIIRenderer {
        if (!this._renderer) 
            throw new Error('Renderer is not initialized - call init() first.');

        return this._renderer;
    }

    private set renderer(value: ASCIIRenderer | null) {
        this._renderer = value;
    }

    /**
     * Initialize the ASCIIGround instance with a canvas, a pattern and renderer options.
     * @param canvas - The HTML canvas element to render on.
     * @param pattern - The pattern to use for rendering.
     * @param options - Optional renderer options.
     */
    public init(
        canvas: HTMLCanvasElement,
        pattern: Pattern,
        options?: Partial<ASCIIRendererOptions>
    ): ASCIIGround {
        this.renderer = new ASCIIRenderer(canvas, pattern, options);
        return this;
    }

    /**
     * Start the animation.
     * @returns The current ASCIIGround instance.
     */
    public startAnimation(): ASCIIGround {
        this.renderer.startAnimation();
        return this;
    }

    /**
     * Stop the animation.
     * @returns The current ASCIIGround instance.
     */
    public stopAnimation(): ASCIIGround {
        this.renderer.stopAnimation();
        return this;
    }

    /**
     * Set a new pattern generator for the renderer.
     * @param pattern - The new pattern to set.
     * @returns The current ASCIIGround instance.
     */
    public setPattern(pattern: Pattern): ASCIIGround {
        this.renderer.pattern = pattern;
        return this;
    }

    /**
     * Set new options for the renderer.
     * @param options - The new options to set.
     * @returns The current ASCIIGround instance.
     */
    public setOptions(options: Partial<ASCIIRendererOptions>): ASCIIGround {
        this.renderer.setOptions(options);
        return this;
    }

    /**
     * Destroy the ASCIIGround instance, cleaning up resources.
     * This will stop the animation and nullify the renderer.
     */
    public destroy(): void {
        this.renderer.destroy();
        this.renderer = null;
    }
}

export default ASCIIGround;
