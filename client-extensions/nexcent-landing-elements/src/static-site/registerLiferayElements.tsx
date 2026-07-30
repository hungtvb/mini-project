import React, {type ReactNode} from 'react';
import {createRoot, type Root} from 'react-dom/client';

import {GlobalModal} from '../components/GlobalModal/GlobalModal';
import {NxcClients} from './sections/Clients';
import {NxcCommunity} from './sections/Community';
import {NxcCta} from './sections/Cta';
import {NxcFeature} from './sections/Feature';
import {NxcHero} from './sections/Hero';
import {NxcMarketing} from './sections/Marketing';
import {NxcStatistics} from './sections/Statistics';
import {NxcTestimonial} from './sections/Testimonial';
import {NxcFooter} from './shell/Footer';
import {NxcHeader} from './shell/Header';
import {LiferayRuntimeOverrides} from './shell/StaticRuntimeOverrides';
import {StaticStyleBoundary} from './shell/StaticStyleBoundary';

type LiferayRenderer = (element: HTMLElement) => ReactNode;

export const liferayElementNames = [
    'nexcent-react-header',
    'nexcent-react-hero',
    'nexcent-react-clients',
    'nexcent-react-community',
    'nexcent-react-feature-primary',
    'nexcent-react-statistics',
    'nexcent-react-feature-secondary',
    'nexcent-react-testimonial',
    'nexcent-react-marketing',
    'nexcent-react-cta',
    'nexcent-react-footer',
    'nexcent-global-modal',
] as const;

function registerShadowReactElement(name: string, renderer: LiferayRenderer) {
    if (customElements.get(name)) {
        return;
    }

    class NexcentLiferayReactElement extends HTMLElement {
        private root?: Root;

        connectedCallback() {
            if (this.root) {
                return;
            }

            const shadowRoot =
                this.shadowRoot ?? this.attachShadow({mode: 'open'});

            this.root = createRoot(shadowRoot);
            this.root.render(
                <React.StrictMode>
                    <StaticStyleBoundary>
                        <LiferayRuntimeOverrides>
                            {renderer(this)}
                        </LiferayRuntimeOverrides>
                    </StaticStyleBoundary>
                </React.StrictMode>
            );
        }

        disconnectedCallback() {
            this.root?.unmount();
            this.root = undefined;
        }
    }

    customElements.define(name, NexcentLiferayReactElement);
}

export function registerLiferayElements() {
    registerShadowReactElement('nexcent-react-header', (element) => (
        <NxcHeader host={element} />
    ));
    registerShadowReactElement('nexcent-react-hero', (element) => (
        <NxcHero host={element} />
    ));
    registerShadowReactElement('nexcent-react-clients', (element) => (
        <NxcClients host={element} />
    ));
    registerShadowReactElement('nexcent-react-community', (element) => (
        <NxcCommunity host={element} />
    ));
    registerShadowReactElement('nexcent-react-feature-primary', (element) => (
        <NxcFeature featureKey="primary" host={element} />
    ));
    registerShadowReactElement('nexcent-react-statistics', (element) => (
        <NxcStatistics host={element} />
    ));
    registerShadowReactElement('nexcent-react-feature-secondary', (element) => (
        <NxcFeature featureKey="secondary" host={element} />
    ));
    registerShadowReactElement('nexcent-react-testimonial', (element) => (
        <NxcTestimonial host={element} />
    ));
    registerShadowReactElement('nexcent-react-marketing', (element) => (
        <NxcMarketing host={element} />
    ));
    registerShadowReactElement('nexcent-react-cta', (element) => (
        <NxcCta host={element} />
    ));
    registerShadowReactElement('nexcent-react-footer', (element) => (
        <NxcFooter host={element} />
    ));
    registerShadowReactElement('nexcent-global-modal', () => <GlobalModal />);
}
