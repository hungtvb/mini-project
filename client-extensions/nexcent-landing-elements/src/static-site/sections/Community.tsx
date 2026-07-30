import type {ButtonHTMLAttributes} from 'react';

import {Community} from '@nexcent/ui';

import {readNumberSetting, readStringSetting} from '../runtime/fragmentSettings';
import {mapNxcCommunityProps} from './Community.mapping';
import {useNxcCommunitySources} from './Community.sources';

type HostProps = {
    host?: HTMLElement;
};

const COMMUNITY_MODAL_RULE = JSON.stringify({
    slots: {
        description: {read: 'text', selector: '.community__description'},
        eyebrow: {value: 'Community solution'},
        media: {read: 'image', selector: '.community__icon img'},
        title: {read: 'text', selector: 'h3'},
    },
    version: 1,
});

const COMMUNITY_ITEM_PROPS = {
    'aria-haspopup': 'dialog',
    className: 'nxc-modal-trigger-card',
    'data-nxc-modal': COMMUNITY_MODAL_RULE,
} as ButtonHTMLAttributes<HTMLButtonElement>;

export function NxcCommunity({host}: HostProps) {
    const structureIdentifier = readStringSetting(
        host,
        'structure-identifier',
        'NXC Service Item'
    );
    const maxItems = readNumberSetting(host, 'max-items', 3, {
        max: 12,
        min: 1,
    });
    const sourceState = useNxcCommunitySources(
        host,
        maxItems,
        structureIdentifier
    );

    if (sourceState.status === 'error') {
        console.error(
            '[NxcCommunity] Failed to load Community content.',
            sourceState.error
        );
        return null;
    }

    if (sourceState.status !== 'ready') {
        return null;
    }

    const props = mapNxcCommunityProps(sourceState.contents, {
        description:
            readStringSetting(host, 'description', '') || undefined,
        title: readStringSetting(host, 'title', '') || undefined,
    });

    return props.items.length > 0 ? (
        <Community
            {...props}
            getItemProps={() => COMMUNITY_ITEM_PROPS}
        />
    ) : null;
}
