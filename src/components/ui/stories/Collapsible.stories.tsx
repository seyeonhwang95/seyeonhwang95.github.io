import type { Meta, StoryObj } from '@storybook/react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../collapsible'
import { Button } from '../button'

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-[320px] space-y-2">
      <CollapsibleTrigger asChild>
        <Button variant="outline">Toggle details</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
        Hidden content is revealed when the trigger is activated.
      </CollapsibleContent>
    </Collapsible>
  ),
}
