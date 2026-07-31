import type {CommunityItem, CommunityProps} from '@nexcent/ui';

import {
    type HeadlessStructuredContent,
    readContentImage,
    readContentText,
} from '../headless/headlessContentClient';

function mapCommunityItem(
    content: HeadlessStructuredContent
): CommunityItem | undefined {
    const image = readContentImage(
        content,
        ['icon', 'image', 'iconFile'],
        {alt: '', url: ''}
    );
    const title = readContentText(
        content,
        ['title', 'heading'],
        content.title || ''
    );

    if (!title || !image.url) {
        return undefined;
    }

    return {
        description:
            readContentText(content, ['description', 'summary'], '') ||
            undefined,
        id: String(content.id),
        image: {
            alt: readContentText(
                content,
                ['iconAlt', 'imageAlt'],
                image.alt
            ),
            src: image.url,
        },
        title,
    };
}

function isCommunityItem(
    item: CommunityItem | undefined
): item is CommunityItem {
    return item !== undefined;
}

export function mapNxcCommunityProps(
    contents: HeadlessStructuredContent[],
    options: Omit<CommunityProps, 'getItemProps' | 'items'>
): CommunityProps {
    return {
        ...options,
        items: contents.map(mapCommunityItem).filter(isCommunityItem),
    };
}
