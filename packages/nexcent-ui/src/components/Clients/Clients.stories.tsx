import type {Meta, StoryObj} from '@storybook/react-vite';

import {clientLogos} from '../../stories/fixtures';
import {Clients} from './Clients';

const meta = {
    args: {
        description: 'We work with teams around the world.',
        logos: clientLogos,
        showTicker: true,
        title: 'Our clients',
    },
    component: Clients,
    tags: ['autodocs'],
    title: 'UI/Clients',
} satisfies Meta<typeof Clients>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const StaticLogos: Story = {args: {showTicker: false}};
