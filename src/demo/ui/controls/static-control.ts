import { StaticNoisePattern } from '../../../patterns/static-noise-pattern';
import type { PatternControlConfig } from './controls-registry';

export const controls: PatternControlConfig = {
    label: 'Static noise',
    pattern: StaticNoisePattern,
    controls: [
        {
            id: 'characters',
            label: 'Characters',
            type: 'text',
            value: '.*#',
            category: 'pattern',
            description: 'Characters used for rendering.',
        },
        {
            id: 'animationSpeed',
            label: 'Animation speed',
            type: 'range',
            value: 10,
            min: 0.1,
            max: 100,
            step: 0.1,
            category: 'pattern',
            description: 'Speed of the static animation.',
        }
    ],
};
