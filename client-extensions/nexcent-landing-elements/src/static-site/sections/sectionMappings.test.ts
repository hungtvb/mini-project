import {describe, expect, it} from 'vitest';

import type {ContentField, StructuredContent} from '../../api/structuredContent';
import {mapNxcCommunityProps} from './Community.mapping';
import {mapNxcHeroProps} from './Hero.mapping';
import {mapNxcMarketingProps} from './Marketing.mapping';

function field(
    name: string,
    value: ContentField['contentFieldValue']
): ContentField {
    return {
        contentFieldValue: value,
        fieldReference: name,
        name,
    };
}

function content(
    id: number,
    title: string,
    contentFields: ContentField[] = []
): StructuredContent {
    return {
        contentFields,
        contentStructureId: 10,
        externalReferenceCode: `content-${id}`,
        id,
        title,
    };
}

const imageField = field('image', {
    image: {
        contentUrl: '/documents/image.png',
        description: 'Fixture image',
    },
});

describe('landing section mappings', () => {
    it('maps valid Hero content without inventing optional values', () => {
        const result = mapNxcHeroProps(
            [content(1, 'Real Hero', [imageField])],
            {
                autoplay: false,
                intervalMs: 3000,
                pauseOnHover: true,
                showPagination: true,
            }
        );

        expect(result.slides).toEqual([
            expect.objectContaining({
                action: undefined,
                id: '1',
                image: {
                    alt: 'Fixture image',
                    src: '/documents/image.png',
                },
                title: 'Real Hero',
            }),
        ]);
    });

    it('drops Hero content that has no real image', () => {
        const result = mapNxcHeroProps([content(1, 'Incomplete Hero')], {
            autoplay: false,
            intervalMs: 3000,
            pauseOnHover: true,
            showPagination: true,
        });

        expect(result.slides).toEqual([]);
    });

    it('drops Community cards without a title or image', () => {
        const valid = content(1, 'Community', [
            field('icon', {
                image: {contentUrl: '/documents/community.png'},
            }),
        ]);
        const missingImage = content(2, 'Missing image');
        const missingTitle = content(3, '', [imageField]);

        const result = mapNxcCommunityProps(
            [valid, missingImage, missingTitle],
            {}
        );

        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toMatchObject({
            id: '1',
            title: 'Community',
        });
    });

    it('does not create a Marketing action when no article URL exists', () => {
        const result = mapNxcMarketingProps(
            [
                {
                    ...content(1, 'Article'),
                    coverImage: {
                        image: {contentUrl: '/documents/article.png'},
                    },
                },
            ],
            {
                readMoreLabel: 'Read more',
                siteBaseUrl: '',
            }
        );

        expect(result.items).toEqual([
            expect.objectContaining({
                action: undefined,
                title: 'Article',
            }),
        ]);
    });
});
