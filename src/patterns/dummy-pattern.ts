import { Pattern, type CharacterData, type PatternContext, type PatternOptions } from './pattern';

export type DummyPatternOptions = PatternOptions

/**
 * Dummy pattern that does not generate any characters.
 * This is useful for initializing the renderer to a well-defined state 
 * without a specific pattern, and in order to avoid doing missing pattern checks.
 */
export class DummyPattern extends Pattern<DummyPatternOptions> {
    public static readonly ID = 'dummy';

    constructor(options: Partial<DummyPatternOptions> = {}) {
        super(options);
    }

    public generate(_context: PatternContext): CharacterData[] {
        return [];
    }
}
