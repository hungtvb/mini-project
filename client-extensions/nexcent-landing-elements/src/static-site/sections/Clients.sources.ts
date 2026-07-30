import {
    readBooleanSetting,
    readStringSetting,
} from '../runtime/fragmentSettings';

const CLIENT_LOGO_SLOTS = 6;

export type NxcClientsSources = {
    description: string;
    logos: Array<{
        alt: string;
        slot: number;
        url: string;
    }>;
    showTicker: boolean;
    title: string;
};

export function readNxcClientsSources(
    host: HTMLElement | undefined
): NxcClientsSources {
    return {
        description: readStringSetting(host, 'description', ''),
        logos: Array.from({length: CLIENT_LOGO_SLOTS}, (_, index) => ({
            alt: readStringSetting(host, `logo-${index + 1}-alt`, ''),
            slot: index + 1,
            url: readStringSetting(host, `logo-${index + 1}-url`, ''),
        })),
        showTicker: readBooleanSetting(host, 'show-ticker', true),
        title: readStringSetting(host, 'title', ''),
    };
}
