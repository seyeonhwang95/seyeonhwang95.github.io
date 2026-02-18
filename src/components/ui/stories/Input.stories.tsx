import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '../input'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '123',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <label htmlFor="input" className="text-sm font-medium">
        Full Name
      </label>
      <Input id="input" placeholder="Enter your name" />
    </div>
  ),
}
