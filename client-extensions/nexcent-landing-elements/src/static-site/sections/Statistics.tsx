import {Statistics} from '@nexcent/ui';

import {mapNxcStatisticsProps} from './Statistics.mapping';
import {readNxcStatisticsSources} from './Statistics.sources';

type HostProps = {
    host?: HTMLElement;
};

export function NxcStatistics({host}: HostProps) {
    const props = mapNxcStatisticsProps(readNxcStatisticsSources(host));

    return <Statistics {...props} />;
}
