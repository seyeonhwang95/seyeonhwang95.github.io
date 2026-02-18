import type { Meta, StoryObj } from '@storybook/react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../input-otp'

const meta = {
  title: 'UI/InputOTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InputOTP>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // @ts-ignore
  args: {},
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        {Array.from({ length: 6 }).map((_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
}
