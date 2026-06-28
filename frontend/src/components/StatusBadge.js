import React from 'react'
import { Chip } from '@mui/material'
import {
  FiberManualRecord,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Chat,
  ThumbUp,
  Description,
} from '@mui/icons-material'

const statusConfig = {
  new: {
    label: 'New',
    color: 'info',
    icon: <FiberManualRecord fontSize="small" />,
  },
  contacted: {
    label: 'Contacted',
    color: 'warning',
    icon: <Chat fontSize="small" />,
  },
  qualified: {
    label: 'Qualified',
    color: 'success',
    icon: <ThumbUp fontSize="small" />,
  },
  proposal: {
    label: 'Proposal Sent',
    color: 'secondary',
    icon: <Description fontSize="small" />,
  },
  negotiation: {
    label: 'Negotiation',
    color: 'warning',
    icon: <HourglassEmpty fontSize="small" />,
  },
  won: {
    label: 'Won',
    color: 'success',
    icon: <CheckCircle fontSize="small" />,
  },
  lost: {
    label: 'Lost',
    color: 'error',
    icon: <Cancel fontSize="small" />,
  },
}

function StatusBadge({ status, size = 'small', variant = 'filled' }) {
  const config = statusConfig[status] || statusConfig.new

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size={size}
      variant={variant}
      sx={{ fontWeight: 'medium' }}
    />
  )
}

export default StatusBadge
