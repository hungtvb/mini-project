import type {MouseEvent} from 'react';

import {Footer, type FooterNavigationItem} from '@nexcent/ui';

import {submitNewsletter} from './Footer.api';
import {mapNxcFooterProps} from './Footer.mapping';
import {readNxcFooterSources} from './Footer.sources';

type FooterAdapterProps = {
    host?: HTMLElement;
};

function handleNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    item: FooterNavigationItem
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

export function NxcFooter({host}: FooterAdapterProps) {
    const sourceState = readNxcFooterSources(host);

    if (sourceState.status === 'error') {
        console.error(
            '[NxcFooter] Failed to read Footer runtime context.',
            sourceState.error
        );
        return null;
    }

    if (sourceState.status !== 'ready') {
        return null;
    }

    const {newsletterEndpoint} = sourceState.sources.settings;
    const props = mapNxcFooterProps(sourceState.sources, (email) =>
        submitNewsletter(newsletterEndpoint, email)
    );

    return <Footer {...props} onNavigate={handleNavigation} />;
}
