import type { Meta, StoryObj } from '@storybook/react'
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '../button-group'
import { Button } from '../button'

const meta = {
  title: 'UI/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="space-y-3">
      <ButtonGroup>
        <Button variant="outline">Left</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Center</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Right</Button>
      </ButtonGroup>
      <ButtonGroupText>Quick actions</ButtonGroupText>
    </div>
  ),
}
