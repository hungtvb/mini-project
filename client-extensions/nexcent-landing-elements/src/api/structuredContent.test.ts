import {beforeEach, describe, expect, it, vi} from 'vitest';

const {portalFetchMock} = vi.hoisted(() => ({
    portalFetchMock: vi.fn(),
}));

vi.mock('./http', () => ({
    portalFetch: portalFetchMock,
}));

import {
    clearStructuredContentRequestCache,
    resolveContentStructure,
} from './structuredContent';

describe('resolveContentStructure', () => {
    beforeEach(() => {
        clearStructuredContentRequestCache();
        portalFetchMock.mockReset();
    });

    it('resolves a structure by its display name', async () => {
        portalFetchMock.mockResolvedValue({
            items: [
                {
                    externalReferenceCode: 'NXC_LANDING_HERO',
                    id: 42,
                    key: 'NXC_LANDING_HERO',
                    name: 'NXC Landing Hero',
                },
            ],
            page: 1,
            pageSize: 200,
            totalCount: 1,
        });

        await expect(
            resolveContentStructure('20125', 'NXC Landing Hero', 'en-US')
        ).resolves.toEqual(
            expect.objectContaining({
                id: 42,
                name: 'NXC Landing Hero',
            })
        );
    });
});
