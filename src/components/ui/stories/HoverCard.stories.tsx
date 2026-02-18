import type { Meta, StoryObj } from '@storybook/react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../hover-card'
import { Button } from '../button'

const meta = {
  title: 'UI/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="space-y-1">
          <p className="text-sm font-medium">Hover details</p>
          <p className="text-sm text-muted-foreground">
            This content appears when you hover the trigger.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}
