import {readStringSetting} from '../runtime/fragmentSettings';

const STATISTIC_SLOTS = 4;

export type NxcStatisticsSources = {
    description: string;
    highlight: string;
    items: Array<{
        iconAlt: string;
        iconUrl: string;
        label: string;
        slot: number;
        value: string;
    }>;
    title: string;
};

export function readNxcStatisticsSources(
    host: HTMLElement | undefined
): NxcStatisticsSources {
    return {
        description: readStringSetting(host, 'description', ''),
        highlight: readStringSetting(host, 'highlight', ''),
        items: Array.from({length: STATISTIC_SLOTS}, (_, index) => ({
            iconAlt: readStringSetting(
                host,
                `metric-${index + 1}-icon-alt`,
                ''
            ),
            iconUrl: readStringSetting(
                host,
                `metric-${index + 1}-icon-url`,
                ''
            ),
            label: readStringSetting(
                host,
                `metric-${index + 1}-label`,
                ''
            ),
            slot: index + 1,
            value: readStringSetting(
                host,
                `metric-${index + 1}-value`,
                ''
            ),
        })),
        title: readStringSetting(host, 'title', ''),
    };
}
