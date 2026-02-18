import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea } from '../scroll-area'

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-40 w-[280px] rounded-md border p-3">
      <div className="space-y-2 text-sm">
        {Array.from({ length: 20 }).map((_, index) => (
          <p key={index}>Scrollable item {index + 1}</p>
        ))}
      </div>
    </ScrollArea>
  ),
}
