import type {Meta, StoryObj} from '@storybook/react-vite';

import {statisticItems} from '../../stories/fixtures';
import {Statistics} from './Statistics';

const meta = {
    args: {
        description: 'We reached here through hard work and dedication.',
        highlight: 'business reinvent itself',
        items: statisticItems,
        title: 'Helping a local',
    },
    component: Statistics,
    tags: ['autodocs'],
    title: 'UI/Statistics',
} satisfies Meta<typeof Statistics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
