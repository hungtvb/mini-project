import {portalFetch} from './http';

export type Page<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
};

export type ContentStructure = {
    externalReferenceCode?: string;
    id: number;
    key?: string;
    name: string;
};

export type ImageValue = {
    contentUrl?: string;
    description?: string;
    id?: number;
    title?: string;
};

export type ContentFieldValue = {
    data?: unknown;
    description?: string;
    document?: ImageValue;
    image?: ImageValue;
};

export type ContentField = {
    contentFieldValue?: ContentFieldValue;
    fieldReference?: string;
    name: string;
    nestedContentFields?: ContentField[];
};

export type StructuredContent = {
    contentFields: ContentField[];
    contentStructureId: number;
    coverImage?: ContentFieldValue;
    datePublished?: string;
    externalReferenceCode: string;
    friendlyUrlPath?: string;
    id: number;
    title: string;
};

const requestCache = new Map<string, Promise<unknown>>();

function normalizeIdentifier(value: string | number | undefined): string {
    return String(value ?? '').trim().toLowerCase();
}

function cachedPortalFetch<T>(path: string, locale = ''): Promise<T> {
    const cacheKey = `${locale}:${path}`;
    const cachedRequest = requestCache.get(cacheKey);

    if (cachedRequest) {
        return cachedRequest as Promise<T>;
    }

    const request = portalFetch<T>(path, {
        headers: locale ? {'Accept-Language': locale} : undefined,
    });

    requestCache.set(cacheKey, request);
    request.catch(() => requestCache.delete(cacheKey));

    return request;
}

export async function listContentStructures(
    siteId: string,
    locale = ''
): Promise<ContentStructure[]> {
    const page = await cachedPortalFetch<Page<ContentStructure>>(
        `/o/headless-delivery/v1.0/sites/${encodeURIComponent(siteId)}/content-structures?pageSize=200`,
        locale
    );

    return page.items;
}

export async function resolveContentStructure(
    siteId: string,
    identifier: string,
    locale = ''
): Promise<ContentStructure> {
    const normalizedIdentifier = normalizeIdentifier(identifier);

    if (!normalizedIdentifier) {
        throw new Error('A Content Structure key, ERC, or name is required.');
    }

    if (/^\d+$/.test(normalizedIdentifier)) {
        return {
            id: Number(normalizedIdentifier),
            name: identifier,
        };
    }

    const structures = await listContentStructures(siteId, locale);
    const structure = structures.find((item) =>
        [item.externalReferenceCode, item.key, item.name, item.id].some(
            (candidate) => normalizeIdentifier(candidate) === normalizedIdentifier
        )
    );

    if (!structure) {
        throw new Error(
            `Content Structure key, ERC, or name "${identifier}" was not found in site ${siteId}.`
        );
    }

    return structure;
}

export async function listStructuredContents(
    contentStructureId: number,
    locale = ''
): Promise<StructuredContent[]> {
    const page = await cachedPortalFetch<Page<StructuredContent>>(
        `/o/headless-delivery/v1.0/content-structures/${encodeURIComponent(
            String(contentStructureId)
        )}/structured-contents?flatten=true&pageSize=100`,
        locale
    );

    return page.items;
}

export function clearStructuredContentRequestCache(): void {
    requestCache.clear();
}
