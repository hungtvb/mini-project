import type {StatisticsProps} from '@nexcent/ui';

import type {NxcStatisticsSources} from './Statistics.sources';

export function mapNxcStatisticsProps(
    sources: NxcStatisticsSources
): StatisticsProps {
    return {
        description: sources.description || undefined,
        highlight: sources.highlight || undefined,
        items: sources.items
            .filter(
                (item) =>
                    Boolean(item.iconUrl) &&
                    Boolean(item.label) &&
                    Boolean(item.value)
            )
            .map((item) => ({
                id: `statistic-${item.slot}`,
                image: {
                    alt: item.iconAlt,
                    src: item.iconUrl,
                },
                label: item.label,
                value: item.value,
            })),
        title: sources.title || undefined,
    };
}
