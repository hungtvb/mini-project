import {useEffect, useState} from 'react';

import {
    type HeadlessStructuredContent,
    loadStructuredContents,
} from '../headless/headlessContentClient';
import {readLocale, readStringSetting} from '../runtime/fragmentSettings';

export type HeroSourceState =
    | {status: 'loading'}
    | {status: 'ready'; contents: HeadlessStructuredContent[]}
    | {status: 'empty'}
    | {status: 'error'; error: Error};

export function useHeroSources(
    host: HTMLElement | undefined,
    maxItems: number,
    structureIdentifier: string
): HeroSourceState {
    const [state, setState] = useState<HeroSourceState>({status: 'loading'});

    useEffect(() => {
        if (!host) {
            setState({status: 'empty'});
            return;
        }

        const siteId = readStringSetting(host, 'site-id');
        const locale = readLocale(host);

        if (!siteId || !structureIdentifier) {
            setState({
                status: 'error',
                error: new Error(
                    !siteId
                        ? 'Missing site-id for Hero content.'
                        : 'Missing Hero content structure identifier.'
                ),
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
                        ? {status: 'ready', contents}
                        : {status: 'empty'}
                );
            })
            .catch((cause: unknown) => {
                if (!active) {
                    return;
                }

                setState({
                    status: 'error',
                    error:
                        cause instanceof Error
                            ? cause
                            : new Error('Unable to load Hero content.'),
                });
            });

        return () => {
            active = false;
        };
    }, [host, maxItems, structureIdentifier]);

    return state;
}
