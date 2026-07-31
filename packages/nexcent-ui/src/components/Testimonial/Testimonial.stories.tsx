import type {Meta, StoryObj} from '@storybook/react-vite';

import {fixtureImage, partnerLogos} from '../../stories/fixtures';
import {Testimonial} from './Testimonial';

const meta = {
    args: {
        action: {
            href: '#customers',
            label: 'Meet all customers',
            target: '_self',
        },
        author: 'Tim Smith',
        image: {
            alt: 'Tim Smith',
            src: fixtureImage('Customer'),
        },
        organization: 'British Dragon Boat Racing Association',
        partnerLogos,
        quote:
            'Nexcent helped our organization simplify membership operations and create a better experience for our community.',
    },
    component: Testimonial,
    tags: ['autodocs'],
    title: 'UI/Testimonial',
} satisfies Meta<typeof Testimonial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutPartners: Story = {args: {partnerLogos: []}};
