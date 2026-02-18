import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from '../checkbox'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'terms',
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <label htmlFor={args.id} className="cursor-pointer">
        Accept terms and conditions
      </label>
    </div>
  ),
}

export const Checked: Story = {
  args: {
    id: 'terms-checked',
    defaultChecked: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <label htmlFor={args.id} className="cursor-pointer">
        I agree
      </label>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    id: 'terms-disabled',
    disabled: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <label htmlFor={args.id} className="cursor-pointer opacity-50">
        Disabled option
      </label>
    </div>
  ),
}
