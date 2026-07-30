import type {HeroProps, HeroSlide} from '@nexcent/ui';

import {
    type HeadlessStructuredContent,
    readContentImage,
    readContentText,
} from '../../../landing/headless/headlessContentClient';

function mapHeroSlide(content: HeadlessStructuredContent): HeroSlide | undefined {
    const image = readContentImage(
        content,
        ['image', 'illustration', 'heroImage', 'imageFile'],
        {alt: '', url: ''}
    );
    const title = readContentText(content, ['title', 'heading'], content.title || '');

    if (!title || !image.url) {
        return undefined;
    }

    const actionHref = readContentText(
        content,
        ['ctaUrl', 'buttonUrl', 'linkUrl'],
        ''
    );
    const actionLabel = readContentText(
        content,
        ['ctaLabel', 'buttonLabel', 'linkLabel'],
        ''
    );
    const actionTarget = readContentText(
        content,
        ['ctaTarget', 'buttonTarget', 'linkTarget'],
        '_self'
    );

    return {
        action:
            actionHref && actionLabel
                ? {
                      href: actionHref,
                      label: actionLabel,
                      target: actionTarget === '_blank' ? '_blank' : '_self',
                  }
                : undefined,
        description: readContentText(content, ['description', 'summary'], ''),
        highlight: readContentText(
            content,
            ['highlightedText', 'highlight'],
            ''
        ),
        id: String(content.id),
        image: {
            alt: readContentText(
                content,
                ['imageAlt', 'illustrationAlt'],
                image.alt
            ),
            src: image.url,
        },
        title,
    };
}

function isHeroSlide(slide: HeroSlide | undefined): slide is HeroSlide {
    return slide !== undefined;
}

export function mapNxcHeroProps(
    contents: HeadlessStructuredContent[],
    options: Omit<HeroProps, 'slides'>
): HeroProps {
    return {
        ...options,
        slides: contents.map(mapHeroSlide).filter(isHeroSlide),
    };
}
