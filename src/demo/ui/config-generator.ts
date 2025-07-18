import type { ASCIIRenderer } from '../../rendering/ascii-renderer';
import { ControlUIGenerator } from './control-ui-generator';
import { PatternProxy } from './pattern-proxy';
import { ControlRegistry } from './control-registry';

/**
 * Main control manager that orchestrates dynamic pattern controls and real-time updates.
 * This is the primary interface for managing pattern controls in the demo page.
 */
export class PatternControlManager {
    private uiGenerator: ControlUIGenerator;
    private patternProxy: PatternProxy;
    private currentPatternType = 'perlin';

    constructor(controlsContainer: HTMLElement, renderer: ASCIIRenderer) {
        this.uiGenerator = new ControlUIGenerator(controlsContainer);
        this.patternProxy = new PatternProxy(renderer);
        
        this.setupEventListeners();
        this.initializeWithDefaultPattern();
    }

    /**
     * Initialize with default pattern and generate controls.
     */
    private initializeWithDefaultPattern(): void {
        // Switch to default pattern
        this.patternProxy.switchPattern(this.currentPatternType);
        
        // Generate UI controls for the default pattern
        this.uiGenerator.generatePatternControls(this.currentPatternType);
        
        // Synchronize UI with current values
        this.synchronizeUIWithCurrentValues();
    }

    /**
     * Setup event listeners between UI and pattern proxy.
     */
    private setupEventListeners(): void {
        // Listen for control changes from UI
        this.setupControlChangeListeners();
        
        // Listen for pattern type changes specifically
        this.uiGenerator.onControlChange('pattern', (value) => {
            this.handlePatternTypeChange(String(value));
        });
    }

    /**
     * Setup listeners for all control types.
     */
    private setupControlChangeListeners(): void {
        const patterns = ControlRegistry.getAvailablePatterns();
        const rendererConfig = ControlRegistry.getRendererControls();

        // Setup listeners for renderer controls
        rendererConfig.controls.forEach(control => {
            this.uiGenerator.onControlChange(control.id, (value) => {
                this.patternProxy.handleControlChange(control.id, value);
            });
        });

        // Setup listeners for all pattern controls
        patterns.forEach(pattern => {
            const patternConfig = ControlRegistry.getPatternControls(pattern.value);
            if (patternConfig) {
                patternConfig.controls.forEach(control => {
                    this.uiGenerator.onControlChange(control.id, (value) => {
                        this.patternProxy.handleControlChange(control.id, value);
                    });
                });
            }
        });

        // Setup animation toggle listener
        this.uiGenerator.onControlChange('animationEnabled', (value) => {
            this.patternProxy.handleControlChange('animationEnabled', value);
        });
    }

    /**
     * Handle pattern type change - regenerate controls and switch pattern.
     */
    private handlePatternTypeChange(newPatternType: string): void {
        if (newPatternType === this.currentPatternType) return;

        this.currentPatternType = newPatternType;
        
        // Switch to new pattern
        this.patternProxy.switchPattern(newPatternType);
        
        // Regenerate controls for new pattern
        this.uiGenerator.generatePatternControls(newPatternType);
        
        // Re-setup event listeners (since controls were regenerated)
        this.setupControlChangeListeners();
        
        // Synchronize UI with new pattern values
        this.synchronizeUIWithCurrentValues();
    }

    /**
     * Synchronize UI controls with current pattern and renderer values.
     */
    private synchronizeUIWithCurrentValues(): void {
        // Get current values from pattern and renderer
        const patternOptions = this.patternProxy.getCurrentPatternOptions();
        const rendererOptions = this.patternProxy.getCurrentRendererOptions();
        
        // Update UI controls to match current values
        Object.entries({ ...patternOptions, ...rendererOptions }).forEach(([key, value]) => {
            this.uiGenerator.setControlValue(key, value);
        });
        
        // Set pattern selector
        this.uiGenerator.setControlValue('pattern', this.currentPatternType);
    }

    /**
     * Get current control values for export/save functionality.
     */
    public getCurrentConfiguration(): Record<string, any> {
        return {
            pattern: this.currentPatternType,
            patternOptions: this.patternProxy.getCurrentPatternOptions(),
            rendererOptions: this.patternProxy.getCurrentRendererOptions(),
            allControls: this.uiGenerator.getAllControlValues(),
        };
    }

    /**
     * Load configuration and update both pattern and UI.
     */
    public loadConfiguration(config: Record<string, any>): void {
        if (config.pattern && config.pattern !== this.currentPatternType) 
            this.handlePatternTypeChange(config.pattern);
        

        // Apply all control values
        if (config.allControls) {
            Object.entries(config.allControls).forEach(([key, value]) => {
                this.uiGenerator.setControlValue(key, value);
                this.patternProxy.handleControlChange(key, value as string | number | boolean | string[]);
            });
        }
    }

    /**
     * Export current configuration as JSON.
     */
    public exportConfiguration(): string {
        return JSON.stringify(this.getCurrentConfiguration(), null, 2);
    }

    /**
     * Import configuration from JSON string.
     */
    public importConfiguration(jsonString: string): boolean {
        try {
            const config = JSON.parse(jsonString);
            this.loadConfiguration(config);
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }

    /**
     * Reset to default configuration.
     */
    public resetToDefaults(): void {
        this.currentPatternType = 'perlin';
        this.initializeWithDefaultPattern();
    }

    /**
     * Add custom control change listener.
     */
    public onControlChange(controlId: string, callback: (value: any) => void): void {
        this.uiGenerator.onControlChange(controlId, callback);
    }

    /**
     * Get current pattern type.
     */
    public getCurrentPatternType(): string {
        return this.currentPatternType;
    }

    /**
     * Get pattern proxy for advanced manipulation.
     */
    public getPatternProxy(): PatternProxy {
        return this.patternProxy;
    }

    /**
     * Get UI generator for advanced UI manipulation.
     */
    public getUIGenerator(): ControlUIGenerator {
        return this.uiGenerator;
    }

    /**
     * Cleanup method.
     */
    public destroy(): void {
        this.uiGenerator.removeAllListeners();
        this.patternProxy.destroy();
    }
}

/**
 * Convenience function to create and initialize pattern controls.
 */
export function createPatternControls(
    controlsContainer: HTMLElement, 
    renderer: ASCIIRenderer
): PatternControlManager {
    return new PatternControlManager(controlsContainer, renderer);
}
