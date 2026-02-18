import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '../context-menu'

const meta = {
  title: 'UI/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [bookmarked, setBookmarked] = React.useState(true)
    const [position, setPosition] = React.useState('top')

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-48 items-center justify-center rounded-md border bg-muted text-sm">
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuLabel inset>Actions</ContextMenuLabel>
          <ContextMenuItem inset>
            Copy
            <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset>Share</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            checked={bookmarked}
            onCheckedChange={(value) => setBookmarked(Boolean(value))}
          >
            Bookmark
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={position} onValueChange={setPosition}>
            <ContextMenuRadioItem value="top">Top</ContextMenuRadioItem>
            <ContextMenuRadioItem value="bottom">Bottom</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}
