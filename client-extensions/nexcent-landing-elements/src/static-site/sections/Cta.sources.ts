import {
    readBooleanSetting,
    readStringSetting,
} from '../runtime/fragmentSettings';

export type NxcCtaSources = {
    buttonHref: string;
    buttonLabel: string;
    buttonTarget: string;
    showButton: boolean;
    title: string;
};

export function readNxcCtaSources(
    host: HTMLElement | undefined
): NxcCtaSources {
    return {
        buttonHref: readStringSetting(host, 'button-url', ''),
        buttonLabel: readStringSetting(host, 'button-label', ''),
        buttonTarget: readStringSetting(host, 'button-target', '_self'),
        showButton: readBooleanSetting(host, 'show-button', true),
        title: readStringSetting(host, 'title', ''),
    };
}
