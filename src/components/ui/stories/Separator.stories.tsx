import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '../separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[280px] space-y-3 text-sm">
      <div>Section A</div>
      <Separator />
      <div>Section B</div>
    </div>
  ),
}
