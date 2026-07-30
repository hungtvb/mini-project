import {useEffect, useState} from 'react';

import {
    type HeadlessStructuredContent,
    loadStructuredContents,
} from '../headless/headlessContentClient';
import {readLocale, readStringSetting} from '../runtime/fragmentSettings';

export type NxcMarketingSourceState =
    | {status: 'loading'}
    | {contents: HeadlessStructuredContent[]; status: 'ready'}
    | {status: 'empty'}
    | {error: Error; status: 'error'};

export function useNxcMarketingSources(
    host: HTMLElement | undefined,
    maxItems: number,
    structureIdentifier: string
): NxcMarketingSourceState {
    const [state, setState] = useState<NxcMarketingSourceState>({
        status: 'loading',
    });

    useEffect(() => {
        if (!host) {
            setState({status: 'empty'});
            return;
        }

        const siteId = readStringSetting(host, 'site-id');
        const locale = readLocale(host);

        if (!siteId || !structureIdentifier) {
            setState({
                error: new Error(
                    !siteId
                        ? 'Missing site-id for Marketing content.'
                        : 'Missing Marketing structure identifier.'
                ),
                status: 'error',
            });
            return;
        }

        let active = true;
        setState({status: 'loading'});

        loadStructuredContents({
            locale,
            pageSize: maxItems,
            siteId,
            structureIdentifier,
        })
            .then((contents) => {
                if (!active) {
                    return;
                }

                setState(
                    contents.length > 0
                        ? {contents, status: 'ready'}
                        : {status: 'empty'}
                );
            })
            .catch((cause: unknown) => {
                if (!active) {
                    return;
                }

                setState({
                    error:
                        cause instanceof Error
                            ? cause
                            : new Error('Unable to load Marketing content.'),
                    status: 'error',
                });
            });

        return () => {
            active = false;
        };
    }, [host, maxItems, structureIdentifier]);

    return state;
}
