import type { ASCIIRenderer } from '../../rendering/ascii-renderer';
import { ControlUIGenerator } from './controls-generator';
import { PatternProxy, type ControlValue } from './pattern-proxy';
import { ControlsRegistry } from './controls/controls-registry';

/**
 * Main control manager that orchestrates dynamic pattern controls and real-time updates.
 * This is the primary interface for managing pattern controls in the demo page.
 */
export class PatternControlsManager {
    private _patternProxy: PatternProxy;
    private _uiGenerator: ControlUIGenerator;

    constructor(controlsContainer: HTMLFormElement, renderer: ASCIIRenderer) {
        this._uiGenerator = new ControlUIGenerator(controlsContainer);
        this._patternProxy = new PatternProxy(renderer);
        const currentPatternId = this._patternProxy.getCurrentPatternId();
        this._uiGenerator.generatePatternControls(currentPatternId);
        this._setupEventListeners();
        this._synchronizeUI();
    }

    /**
     * Switch to a different pattern type.
     */
    public switchPattern(patternId: string): void {
        this._handlePatternChange(patternId);
    }

    /**
     * Add custom control change listener.
     */
    public onControlChange(controlId: string, callback: (value: ControlValue) => void): void {
        this._uiGenerator.onControlChange(controlId, callback);
    }

    /**
     * Setup event listeners between UI and pattern proxy.
     */
    private _setupEventListeners(): void {
        this._setupControlChangeListeners();
        this._uiGenerator.onControlChange('pattern', (value: ControlValue) => this._handlePatternChange(String(value)));
    }

    /**
     * Setup listeners for all control types.
     */
    private _setupControlChangeListeners(): void {
        const rendererConfig = ControlsRegistry.getRendererControls();
        const currentPatternId = this._patternProxy.getCurrentPatternId();
        const patternConfig = ControlsRegistry.getPatternControls(currentPatternId);

        rendererConfig.controls.forEach((control) => {
            this._uiGenerator.onControlChange((control.id), (value: ControlValue) => {
                this._patternProxy.handleControlChange(control.category, control.id, value);
            });
        });
    
        patternConfig.controls.forEach((control) => {
            this._uiGenerator.onControlChange((control.id), (value) => {
                this._patternProxy.handleControlChange(control.category, control.id, value);
            });
        });
    }

    /**
     * Handle pattern type change by regenerating controls and updating the pattern.
     * @param patternType - the new pattern type to switch to.
     */
    private _handlePatternChange(patternType: string): void {
        this._patternProxy.switchPattern(patternType);
        this._uiGenerator.generatePatternControls(patternType);
        this._setupControlChangeListeners();
        this._synchronizeUI();
    }

    /**
     * Synchronize UI controls with current pattern and renderer values.
     */
    private _synchronizeUI(): void {
        const patternOptions = this._patternProxy.getPatternOptions();
        const rendererOptions = this._patternProxy.getRendererOptions();
        const currentPatternId = this._patternProxy.getCurrentPatternId();

        Object.entries({
            ...patternOptions,
            ...rendererOptions,
        }).forEach(([key, value]) => {
            this._uiGenerator.setControlValue(key, value);
        });

        this._uiGenerator.setControlValue('pattern', currentPatternId);
    }
}

/**
 * Convenience function to create and initialize pattern controls.
 */
export function createPatternControls(container: HTMLFormElement, renderer: ASCIIRenderer): PatternControlsManager {
    return new PatternControlsManager(container, renderer);
}
