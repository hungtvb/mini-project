import type {FeatureProps} from '@nexcent/ui';

import type {NxcFeatureSources} from './Feature.sources';

export function mapNxcFeatureProps(
    sources: NxcFeatureSources
): FeatureProps {
    return {
        action:
            sources.showButton &&
            sources.buttonHref &&
            sources.buttonLabel
                ? {
                      href: sources.buttonHref,
                      label: sources.buttonLabel,
                      target:
                          sources.buttonTarget === '_blank'
                              ? '_blank'
                              : '_self',
                  }
                : undefined,
        description: sources.description || undefined,
        image: {
            alt: sources.imageAlt,
            src: sources.imageUrl,
        },
        sectionId: sources.featureKey === 'primary' ? 'features' : undefined,
        title: sources.title,
    };
}
