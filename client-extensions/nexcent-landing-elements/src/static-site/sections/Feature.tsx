import type {AnchorHTMLAttributes} from 'react';

import {Feature} from '@nexcent/ui';

import {mapNxcFeatureProps} from './Feature.mapping';
import {
    type FeatureKey,
    readNxcFeatureSources,
} from './Feature.sources';

type HostProps = {
    host?: HTMLElement;
};

type FeatureAdapterProps = HostProps & {
    featureKey: FeatureKey;
};

export function NxcFeature({featureKey, host}: FeatureAdapterProps) {
    const props = mapNxcFeatureProps(
        readNxcFeatureSources(featureKey, host)
    );

    if (!props.title || !props.image.src) {
        return null;
    }

    const modalRule = JSON.stringify({
        id: `feature-${featureKey}`,
        slots: {
            description: {value: props.description || ''},
            eyebrow: {value: 'Feature'},
            media: {
                alt: props.image.alt,
                url: props.image.src,
            },
            title: {value: props.title},
        },
        version: 1,
    });
    const actionProps = props.action
        ? ({
              'aria-haspopup': 'dialog',
              'data-nxc-modal': modalRule,
          } as AnchorHTMLAttributes<HTMLAnchorElement>)
        : undefined;

    return <Feature {...props} actionProps={actionProps} />;
}
