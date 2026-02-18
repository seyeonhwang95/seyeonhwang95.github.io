import type { Meta, StoryObj } from '@storybook/react'
import { AspectRatio } from '../aspect-ratio'

const meta = {
  title: 'UI/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <AspectRatio ratio={16 / 9} className="w-[320px] rounded-md bg-muted">
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        16:9 content
      </div>
    </AspectRatio>
  ),
}
