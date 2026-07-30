import {
    readBooleanSetting,
    readStringSetting,
} from '../runtime/fragmentSettings';

export type FeatureKey = 'primary' | 'secondary';

export type NxcFeatureSources = {
    buttonHref: string;
    buttonLabel: string;
    buttonTarget: string;
    description: string;
    featureKey: FeatureKey;
    imageAlt: string;
    imageUrl: string;
    showButton: boolean;
    title: string;
};

export function readNxcFeatureSources(
    featureKey: FeatureKey,
    host: HTMLElement | undefined
): NxcFeatureSources {
    return {
        buttonHref: readStringSetting(host, 'button-url', ''),
        buttonLabel: readStringSetting(host, 'button-label', ''),
        buttonTarget: readStringSetting(host, 'button-target', '_self'),
        description: readStringSetting(host, 'description', ''),
        featureKey,
        imageAlt: readStringSetting(host, 'image-alt', ''),
        imageUrl: readStringSetting(host, 'image-url', ''),
        showButton: readBooleanSetting(host, 'show-button', true),
        title: readStringSetting(host, 'title', ''),
    };
}
