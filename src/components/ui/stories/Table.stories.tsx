import type { Meta, StoryObj } from '@storybook/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Table className="w-[360px]">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alex Johnson</TableCell>
          <TableCell>Active</TableCell>
          <TableCell className="text-right">Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jamie Lee</TableCell>
          <TableCell>Pending</TableCell>
          <TableCell className="text-right">Editor</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
