import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OperatorRequestIndicator } from './OperatorRequestIndicator'
import { OperatorRequest } from '../../services/operatorRequestsApi'

// Mock the UI components
vi.mock('../ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

vi.mock('../ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('../ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}))

vi.mock('../../lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

describe('OperatorRequestIndicator', () => {
  const mockOperatorRequest: OperatorRequest = {
    id: '1',
    workspaceId: 'workspace-1',
    chatId: 'chat-1',
    phoneNumber: '+1234567890',
    message: 'Help needed',
    timestamp: '2024-01-01T10:00:00Z',
    status: 'PENDING',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  }

  const mockOnTakeControl = vi.fn()

  it('renders operator request indicator', () => {
    render(
      <OperatorRequestIndicator
        operatorRequest={mockOperatorRequest}
        onTakeControl={mockOnTakeControl}
      />
    )

    expect(screen.getByText('🆘 Richiesta Operatore')).toBeDefined()
    expect(screen.getAllByText('Help needed', { exact: false }).length).toBeGreaterThan(0)
  })

  it('calls onTakeControl when button is clicked', () => {
    render(
      <OperatorRequestIndicator
        operatorRequest={mockOperatorRequest}
        onTakeControl={mockOnTakeControl}
      />
    )

    const button = screen.getByRole('button')
    button.click()

    expect(mockOnTakeControl).toHaveBeenCalledWith('1')
  })
})