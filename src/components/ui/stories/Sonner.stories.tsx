import type { Meta, StoryObj } from '@storybook/react'
import { ThemeProvider } from 'next-themes'
import { toast } from 'sonner'
import { Toaster } from '../sonner'
import { Button } from '../button'

const meta = {
  title: 'UI/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="space-y-3">
        <Button onClick={() => toast('Saved successfully')}>Show toast</Button>
        <Toaster />
      </div>
    </ThemeProvider>
  ),
}
