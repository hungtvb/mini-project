import type {ClientsProps} from '@nexcent/ui';

import type {NxcClientsSources} from './Clients.sources';

export function mapNxcClientsProps(
    sources: NxcClientsSources
): ClientsProps {
    return {
        description: sources.description || undefined,
        logos: sources.logos
            .filter((logo) => Boolean(logo.url))
            .map((logo) => ({
                alt: logo.alt,
                id: `client-logo-${logo.slot}`,
                src: logo.url,
            })),
        showTicker: sources.showTicker,
        title: sources.title || undefined,
    };
}
