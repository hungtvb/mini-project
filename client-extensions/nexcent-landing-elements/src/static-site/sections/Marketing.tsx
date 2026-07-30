import {Marketing} from '@nexcent/ui';

import {readNumberSetting, readStringSetting} from '../runtime/fragmentSettings';
import {mapNxcMarketingProps} from './Marketing.mapping';
import {useNxcMarketingSources} from './Marketing.sources';

type HostProps = {
    host?: HTMLElement;
};

export function StaticMarketing({host}: HostProps) {
    const structureIdentifier = readStringSetting(
        host,
        'structure-identifier',
        'NXC Community Card'
    );
    const maxItems = readNumberSetting(host, 'max-items', 3, {
        max: 12,
        min: 1,
    });
    const sourceState = useNxcMarketingSources(
        host,
        maxItems,
        structureIdentifier
    );

    if (sourceState.status === 'error') {
        console.error(
            '[NxcMarketing] Failed to load Marketing content.',
            sourceState.error
        );
        return null;
    }

    if (sourceState.status !== 'ready') {
        return null;
    }

    const props = mapNxcMarketingProps(sourceState.contents, {
        description:
            readStringSetting(host, 'description', '') || undefined,
        readMoreLabel: readStringSetting(
            host,
            'read-more-label',
            'Readmore'
        ),
        siteBaseUrl: readStringSetting(host, 'data-site-base-url', ''),
        title: readStringSetting(host, 'title', '') || undefined,
    });

    return props.items.length > 0 ? <Marketing {...props} /> : null;
}
