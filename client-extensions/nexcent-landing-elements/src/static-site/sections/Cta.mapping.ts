import type {CtaProps} from '@nexcent/ui';

import type {NxcCtaSources} from './Cta.sources';

export function mapNxcCtaProps(sources: NxcCtaSources): CtaProps {
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
        title: sources.title,
    };
}
