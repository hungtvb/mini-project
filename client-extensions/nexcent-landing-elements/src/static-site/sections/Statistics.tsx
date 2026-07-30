import {Statistics} from '@nexcent/ui';

import {mapNxcStatisticsProps} from './Statistics.mapping';
import {readNxcStatisticsSources} from './Statistics.sources';

type HostProps = {
    host?: HTMLElement;
};

export function StaticStatistics({host}: HostProps) {
    const props = mapNxcStatisticsProps(readNxcStatisticsSources(host));

    return <Statistics {...props} />;
}
