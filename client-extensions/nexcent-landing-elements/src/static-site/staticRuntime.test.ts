import {describe, expect, it} from 'vitest';

import {liferayElementNames} from './registerLiferayElements';
import {normalizeStaticCss} from './shell/StaticStyleBoundary';

describe('Nexcent Liferay React runtime', () => {
    it('registers unique custom element names', () => {
        expect(new Set(liferayElementNames).size).toBe(
            liferayElementNames.length
        );
        expect(liferayElementNames.every((name) => name.includes('-'))).toBe(
            true
        );
    });

    it('preserves the prototype 62.5 percent rem scale inside Shadow DOM', () => {
        expect(normalizeStaticCss('padding: 1.6rem; margin: -0.25rem;')).toBe(
            'padding: 16px; margin: -2.5px;'
        );
    });

    it('maps prototype brand colors to inherited Style Book variables', () => {
        expect(normalizeStaticCss('color: #4caf4f; background: #fff;')).toBe(
            'color: var(--nxc-color-primary, #4caf4f); background: var(--nxc-color-white, #fff);'
        );
    });

    it('removes the prototype source map comment', () => {
        expect(
            normalizeStaticCss('a{}/*# sourceMappingURL=style.css.map */')
        ).toBe('a{}');
    });
});
