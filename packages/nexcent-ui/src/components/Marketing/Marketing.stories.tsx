import type {Meta, StoryObj} from '@storybook/react-vite';

import {marketingItems} from '../../stories/fixtures';
import {Marketing} from './Marketing';

const meta = {
    args: {
        description:
            'Read the latest membership insights, trends, and community stories.',
        items: marketingItems,
        title: 'Caring is the new marketing',
    },
    component: Marketing,
    tags: ['autodocs'],
    title: 'UI/Marketing',
} satisfies Meta<typeof Marketing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleCard: Story = {args: {items: marketingItems.slice(0, 1)}};
