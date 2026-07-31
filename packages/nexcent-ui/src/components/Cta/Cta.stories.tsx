import type {Meta, StoryObj} from '@storybook/react-vite';

import {Cta} from './Cta';

const meta = {
    args: {
        action: {
            href: '#demo',
            label: 'Get a demo',
            target: '_self',
        },
        title: 'Build a stronger digital community.',
    },
    component: Cta,
    tags: ['autodocs'],
    title: 'UI/CTA',
} satisfies Meta<typeof Cta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutAction: Story = {args: {action: undefined}};
