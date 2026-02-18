import type { Meta, StoryObj } from '@storybook/react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../resizable'

const meta = {
  title: 'UI/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResizablePanelGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-40 w-[320px] rounded-md border"
    >
      <ResizablePanel defaultSize={50} className="flex items-center justify-center">
        Left
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} className="flex items-center justify-center">
        Right
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}
