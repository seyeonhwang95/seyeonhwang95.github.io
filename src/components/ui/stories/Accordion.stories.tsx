import type { Meta, StoryObj } from '@storybook/react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion'

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // @ts-ignore
  args: {},
  render: () => (
    <Accordion type="single" collapsible className="w-[350px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is this?</AccordionTrigger>
        <AccordionContent>
          This is an accordion item with a short description.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Can I have more?</AccordionTrigger>
        <AccordionContent>
          Yes. Add more items as needed to organize content.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
