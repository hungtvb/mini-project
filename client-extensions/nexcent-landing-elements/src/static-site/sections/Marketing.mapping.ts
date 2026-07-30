import type {MarketingItem, MarketingProps} from '@nexcent/ui';

import {
    type HeadlessStructuredContent,
    readContentImage,
    readContentText,
} from '../headless/headlessContentClient';
import {buildArticleDetailUrl} from '../../utils/url';

function mapMarketingItem(
    content: HeadlessStructuredContent,
    readMoreLabel: string,
    siteBaseUrl: string
): MarketingItem | undefined {
    const coverImageUrl = content.coverImage?.image?.contentUrl?.trim() || '';
    const coverImageAlt =
        content.coverImage?.description?.trim() ||
        content.coverImage?.image?.description?.trim() ||
        '';
    const image = coverImageUrl
        ? {alt: coverImageAlt, url: coverImageUrl}
        : readContentImage(
              content,
              ['coverImage', 'thumbnail', 'image', 'thumbnailFile'],
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

    const articleUrl = buildArticleDetailUrl(
        siteBaseUrl,
        content.friendlyUrlPath
    );
    const actionLabel =
        readContentText(content, ['linkLabel', 'ctaLabel'], '') ||
        readMoreLabel;

    return {
        action:
            articleUrl && actionLabel
                ? {
                      href: articleUrl,
                      label: actionLabel,
                      target: '_self',
                  }
                : undefined,
        id: String(content.id),
        image: {
            alt: image.alt || title,
            src: image.url,
        },
        title,
    };
}

function isMarketingItem(
    item: MarketingItem | undefined
): item is MarketingItem {
    return item !== undefined;
}

export function mapNxcMarketingProps(
    contents: HeadlessStructuredContent[],
    options: {
        description?: string;
        readMoreLabel: string;
        siteBaseUrl: string;
        title?: string;
    }
): MarketingProps {
    return {
        description: options.description,
        items: contents
            .map((content) =>
                mapMarketingItem(
                    content,
                    options.readMoreLabel,
                    options.siteBaseUrl
                )
            )
            .filter(isMarketingItem),
        title: options.title,
    };
}
