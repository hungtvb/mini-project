import {useEffect, useState} from 'react';

import {
    type HeadlessStructuredContent,
    loadStructuredContents,
} from '../headless/headlessContentClient';
import {readLocale, readStringSetting} from '../runtime/fragmentSettings';

export type NxcCommunitySourceState =
    | {status: 'loading'}
    | {contents: HeadlessStructuredContent[]; status: 'ready'}
    | {status: 'empty'}
    | {error: Error; status: 'error'};

export function useNxcCommunitySources(
    host: HTMLElement | undefined,
    maxItems: number,
    structureIdentifier: string
): NxcCommunitySourceState {
    const [state, setState] = useState<NxcCommunitySourceState>({
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
                        ? 'Missing site-id for Community content.'
                        : 'Missing Community structure identifier.'
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
                            : new Error('Unable to load Community content.'),
                    status: 'error',
                });
            });

        return () => {
            active = false;
        };
    }, [host, maxItems, structureIdentifier]);

    return state;
}
