import type { ControlSpec } from './control-registry';
import { ControlRegistry } from './control-registry';

/**
 * Dynamic UI generator that creates controls based on pattern specifications.
 */
export class ControlUIGenerator {
    private container: HTMLElement;
    private listeners: Map<string, Array<(value: any) => void>> = new Map();

    constructor(container: HTMLElement) {
        this.container = container;
    }

    /**
     * Generate controls for a specific pattern type.
     */
    public generatePatternControls(patternType: string): void {
        this.clearControls();
        
        const patternConfig = ControlRegistry.getPatternControls(patternType);
        const rendererConfig = ControlRegistry.getRendererControls();

        if (!patternConfig) {
            console.warn(`No controls found for pattern: ${patternType}`);
            return;
        }

        // Create pattern selection dropdown
        this.createPatternSelector(patternType);

        // Create renderer controls section
        this.createControlSection('Renderer Settings', rendererConfig.controls);

        // Create pattern-specific controls section
        this.createControlSection(`${patternConfig.name} Settings`, patternConfig.controls);

        // Add animation toggle
        this.createAnimationToggle();
    }

    /**
     * Create a section with grouped controls.
     */
    private createControlSection(title: string, controls: ControlSpec[]): void {
        // const section = document.createElement('div');
        // section.className = 'control-section';

        // const header = document.createElement('h3');
        // header.className = 'section-header gradient-text';
        // header.textContent = title;
        // section.appendChild(header);
        // this.container.appendChild(header);

        // const controlsContainer = document.createElement('div');
        // controlsContainer.className = 'controls-container';

        controls.forEach(control => {
            const controlElement = this.createControl(control);
            // controlsContainer.appendChild(controlElement);
            this.container.appendChild(controlElement);
        });

        // section.appendChild(controlsContainer);
        // this.container.appendChild(section);
    }

    /**
     * Create pattern selector dropdown.
     */
    private createPatternSelector(currentPattern: string): void {
        const patterns = ControlRegistry.getAvailablePatterns();
        
        const control: ControlSpec = {
            id: 'pattern',
            label: 'Pattern',
            type: 'select',
            value: currentPattern,
            options: patterns,
            category: 'renderer',
            description: 'Select the animation pattern type.',
        };

        const controlElement = this.createControl(control);
        controlElement.classList.add('pattern-selector');
        this.container.appendChild(controlElement);
    }

    /**
     * Create animation toggle control.
     */
    private createAnimationToggle(): void {
        const control: ControlSpec = {
            id: 'animationEnabled',
            label: 'Animation',
            type: 'checkbox',
            value: true,
            category: 'renderer',
            description: 'Enable or disable animation.',
        };

        const controlElement = this.createControl(control);
        controlElement.classList.add('animation-toggle');
        this.container.appendChild(controlElement);
    }

    /**
     * Create a single control element based on its specification.
     */
    private createControl(spec: ControlSpec): HTMLElement {
        const label = document.createElement('label');
        label.className = `control-item control-${spec.type}`;
        label.setAttribute('data-control-id', spec.id);

        // Label text
        const labelText = document.createElement('span');
        labelText.className = 'control-label';
        labelText.textContent = spec.label;
        
        if (spec.description) 
            labelText.title = spec.description;
        

        label.appendChild(labelText);

        // Create input element based on type
        let input: HTMLElement;

        switch (spec.type) {
            case 'number':
            case 'range':
                input = this.createNumberInput(spec);
                break;
            case 'text':
                input = this.createTextInput(spec);
                break;
            case 'textarea':
                input = this.createTextAreaInput(spec);
                break;
            case 'color':
                input = this.createColorInput(spec);
                break;
            case 'select':
                input = this.createSelectInput(spec);
                break;
            case 'checkbox':
                input = this.createCheckboxInput(spec);
                break;
            default:
                input = this.createTextInput(spec);
        }

        input.setAttribute('data-control-id', spec.id);
        label.appendChild(input);

        // Add change listener
        input.addEventListener('input', (event) => {
            this.handleControlChange(spec.id, event);
        });

        input.addEventListener('change', (event) => {
            this.handleControlChange(spec.id, event);
        });

        return label;
    }

    /**
     * Create number/range input.
     */
    private createNumberInput(spec: ControlSpec): HTMLInputElement {
        const input = document.createElement('input');
        input.type = spec.type === 'range' ? 'range' : 'number';
        input.value = String(spec.value);
        
        if (spec.min !== undefined) input.min = String(spec.min);
        if (spec.max !== undefined) input.max = String(spec.max);
        if (spec.step !== undefined) input.step = String(spec.step);

        // For range inputs, also show the current value
        if (spec.type === 'range') {
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'range-value';
            valueDisplay.textContent = String(spec.value);
            
            input.addEventListener('input', () => {
                valueDisplay.textContent = input.value;
            });

            // Wrap in container
            const container = document.createElement('div');
            container.className = 'range-container';
            container.appendChild(input);
            container.appendChild(valueDisplay);
            
            return container as any; // Type assertion for convenience
        }

        return input;
    }

    /**
     * Create text input.
     */
    private createTextInput(spec: ControlSpec): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = String(spec.value);
        return input;
    }

    /**
     * Create textarea input.
     */
    private createTextAreaInput(spec: ControlSpec): HTMLTextAreaElement {
        const input = document.createElement('textarea');
        input.value = String(spec.value);
        input.rows = 2;
        return input;
    }

    /**
     * Create color input.
     */
    private createColorInput(spec: ControlSpec): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = String(spec.value);
        return input;
    }

    /**
     * Create select input.
     */
    private createSelectInput(spec: ControlSpec): HTMLSelectElement {
        const select = document.createElement('select');
        
        if (spec.options) {
            spec.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = String(option.value);
                optionElement.textContent = option.label;
                optionElement.selected = option.value === spec.value;
                select.appendChild(optionElement);
            });
        }

        return select;
    }

    /**
     * Create checkbox input.
     */
    private createCheckboxInput(spec: ControlSpec): HTMLElement {
        const container = document.createElement('div');
        container.className = 'toggle-switch';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = Boolean(spec.value);

        const slider = document.createElement('span');
        slider.className = 'toggle-slider';

        container.appendChild(input);
        container.appendChild(slider);

        return container;
    }

    /**
     * Handle control value changes.
     */
    private handleControlChange(controlId: string, event: Event): void {
        const target = event.target as HTMLInputElement;
        let value: any;

        switch (target.type) {
            case 'checkbox':
                value = target.checked;
                break;
            case 'number':
            case 'range':
                value = parseFloat(target.value);
                break;
            default:
                value = target.value;
        }

        // Special handling for characters (convert to array)
        if (controlId === 'characters') 
            value = value.split('').filter((char: string) => char.trim() !== '');
        

        // Emit change event
        this.emitChange(controlId, value);
    }

    /**
     * Add listener for control changes.
     */
    public onControlChange(controlId: string, callback: (value: any) => void): void {
        if (!this.listeners.has(controlId)) 
            this.listeners.set(controlId, []);
        
        this.listeners.get(controlId)!.push(callback);
    }

    /**
     * Remove all listeners for a control.
     */
    public removeControlListeners(controlId: string): void {
        this.listeners.delete(controlId);
    }

    /**
     * Remove all listeners.
     */
    public removeAllListeners(): void {
        this.listeners.clear();
    }

    /**
     * Emit change event to all listeners.
     */
    private emitChange(controlId: string, value: any): void {
        const listeners = this.listeners.get(controlId);
        if (listeners) 
            listeners.forEach(callback => callback(value));
        
    }

    /**
     * Get current value of a control.
     */
    public getControlValue(controlId: string): any {
        const element = this.container.querySelector(`[data-control-id="${controlId}"]`) as HTMLInputElement;
        if (!element) return null;

        switch (element.type) {
            case 'checkbox':
                return element.checked;
            case 'number':
            case 'range':
                return parseFloat(element.value);
            default:
                return element.value;
        }
    }

    /**
     * Set value of a control.
     */
    public setControlValue(controlId: string, value: any): void {
        const element = this.container.querySelector(`[data-control-id="${controlId}"]`) as HTMLInputElement;
        if (!element) return;

        switch (element.type) {
            case 'checkbox':
                element.checked = Boolean(value);
                break;
            case 'number':
            case 'range':
                element.value = String(value);
                // Update range display if present
                const valueDisplay = element.parentElement?.querySelector('.range-value');
                if (valueDisplay) 
                    valueDisplay.textContent = String(value);
                
                break;
            default:
                element.value = String(value);
        }
    }

    /**
     * Clear all controls from the container.
     */
    private clearControls(): void {
        this.container.innerHTML = '';
        this.removeAllListeners();
    }

    /**
     * Get all current control values.
     */
    public getAllControlValues(): Record<string, any> {
        const values: Record<string, any> = {};
        const controls = this.container.querySelectorAll('[data-control-id]');
        
        controls.forEach(control => {
            const controlId = control.getAttribute('data-control-id');
            if (controlId) 
                values[controlId] = this.getControlValue(controlId);
            
        });

        return values;
    }
}
