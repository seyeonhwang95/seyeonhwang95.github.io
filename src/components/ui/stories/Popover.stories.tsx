import type { Meta, StoryObj } from '@storybook/react'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Button } from '../button'

const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-1">
          <p className="text-sm font-medium">Popover title</p>
          <p className="text-sm text-muted-foreground">
            Add content here to provide more context.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
}
