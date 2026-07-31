import {Hero} from '@nexcent/ui';

import {
    readBooleanSetting,
    readNumberSetting,
    readStringSetting,
} from '../runtime/fragmentSettings';
import {mapNxcHeroProps} from './Hero.mapping';
import {useNxcHeroSources} from './Hero.sources';

type HeroAdapterProps = {
    host?: HTMLElement;
};

export function NxcHero({host}: HeroAdapterProps) {
    const structureIdentifier = readStringSetting(
        host,
        'structure-identifier',
        'NXC Landing Hero'
    );
    const maxSlides = readNumberSetting(host, 'max-slides', 3, {
        max: 10,
        min: 1,
    });
    const sourceState = useNxcHeroSources(
        host,
        maxSlides,
        structureIdentifier
    );

    if (sourceState.status === 'error') {
        console.error('[NxcHero] Failed to load Hero content.', sourceState.error);
        return null;
    }

    if (sourceState.status !== 'ready') {
        return null;
    }

    const heroProps = mapNxcHeroProps(sourceState.contents, {
        autoplay: readBooleanSetting(host, 'autoplay', true),
        intervalMs: readNumberSetting(host, 'interval', 3000, {
            max: 30000,
            min: 1000,
        }),
        pauseOnHover: readBooleanSetting(host, 'pause-on-hover', true),
        showPagination: readBooleanSetting(host, 'show-pagination', true),
    });

    return heroProps.slides.length > 0 ? <Hero {...heroProps} /> : null;
}
