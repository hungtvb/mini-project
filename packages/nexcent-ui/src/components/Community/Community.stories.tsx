import type {Meta, StoryObj} from '@storybook/react-vite';

import {communityItems} from '../../stories/fixtures';
import {Community} from './Community';

const meta = {
    args: {
        description: 'Choose the community model that fits your organization.',
        items: communityItems,
        title: 'Manage your entire community',
    },
    component: Community,
    tags: ['autodocs'],
    title: 'UI/Community',
} satisfies Meta<typeof Community>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutHeading: Story = {
    args: {description: undefined, title: undefined},
};
