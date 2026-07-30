import {Cta} from '@nexcent/ui';

import {mapNxcCtaProps} from './Cta.mapping';
import {readNxcCtaSources} from './Cta.sources';

type HostProps = {
    host?: HTMLElement;
};

export function NxcCta({host}: HostProps) {
    const props = mapNxcCtaProps(readNxcCtaSources(host));

    return <Cta {...props} />;
}
