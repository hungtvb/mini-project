import type {Meta, StoryObj} from '@storybook/react-vite';

import {
    fixtureImage,
    footerNavigation,
    socialNavigation,
} from '../../stories/fixtures';
import {Footer} from './Footer';

const meta = {
    args: {
        companyHeading: 'Company',
        companyNavigation: footerNavigation,
        copyrightText: 'Copyright © 2026 Nexcent.',
        logo: {
            alt: 'Nexcent',
            src: fixtureImage('Nexcent'),
        },
        newsletter: {
            errorText: 'Subscription failed. Please try again.',
            icon: {alt: '', src: fixtureImage('→')},
            placeholder: 'Your email address',
            submit: async () => undefined,
            submitLabel: 'Subscribe',
            submittingText: 'Submitting…',
            successText: 'Thank you for subscribing.',
            title: 'Stay up to date',
        },
        rightsText: 'All rights reserved.',
        site: {
            homeUrl: '#home',
            name: 'Nexcent',
        },
        socialNavigation,
        supportHeading: 'Support',
        supportNavigation: footerNavigation,
    },
    component: Footer,
    parameters: {layout: 'fullscreen'},
    tags: ['autodocs'],
    title: 'UI/Footer',
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutNewsletter: Story = {args: {newsletter: undefined}};
