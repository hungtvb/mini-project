import {Clients} from '@nexcent/ui';

import {mapNxcClientsProps} from './Clients.mapping';
import {readNxcClientsSources} from './Clients.sources';

type HostProps = {
    host?: HTMLElement;
};

export function StaticClients({host}: HostProps) {
    const props = mapNxcClientsProps(readNxcClientsSources(host));

    return <Clients {...props} />;
}
