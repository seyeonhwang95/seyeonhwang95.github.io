import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. You can add any content inside the card.</p>
      </CardContent>
    </Card>
  ),
}

export const WithLongContent: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Features</CardTitle>
        <CardDescription>What this component offers</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-inside list-disc space-y-1">
          <li>Easy to use</li>
          <li>Customizable</li>
          <li>Responsive design</li>
          <li>Built with Tailwind CSS</li>
        </ul>
      </CardContent>
    </Card>
  ),
}
