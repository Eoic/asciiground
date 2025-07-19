import type { PatternControlConfig } from './controls-registry';

export const controls: PatternControlConfig = {
    label: 'Static',
    controls: [
        {
            id: 'characters',
            label: 'Characters',
            type: 'textarea',
            value: ' .*#',
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
