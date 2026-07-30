import type {MouseEvent} from 'react';

import {Header, type HeaderNavigationItem} from '@nexcent/ui';

import {mapNxcHeaderProps} from './Header.mapping';
import {readNxcHeaderSources} from './Header.sources';

type HeaderAdapterProps = {
    host?: HTMLElement;
};

function handleNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    item: HeaderNavigationItem
) {
    if (!item.url.startsWith('#') || item.url === '#') {
        return;
    }

    const rootNode = event.currentTarget.getRootNode();
    const shadowTarget =
        rootNode instanceof ShadowRoot
            ? rootNode.querySelector<HTMLElement>(item.url)
            : null;
    const target =
        document.querySelector<HTMLElement>(item.url) ?? shadowTarget;

    if (!target) {
        return;
    }

    event.preventDefault();
    target.scrollIntoView({behavior: 'smooth', block: 'start'});
    window.history.replaceState(null, '', item.url);
}

export function NxcHeader({host}: HeaderAdapterProps) {
    const sourceState = readNxcHeaderSources(host);

    if (sourceState.status === 'error') {
        console.error(
            '[NxcHeader] Failed to read Header runtime context.',
            sourceState.error
        );
        return null;
    }

    if (sourceState.status !== 'ready') {
        return null;
    }

    const props = mapNxcHeaderProps(sourceState.sources);

    return <Header {...props} onNavigate={handleNavigation} />;
}
