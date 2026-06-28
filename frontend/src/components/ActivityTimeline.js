import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material'
import {
  Phone,
  Email,
  MeetingRoom,
  Note,
  Task,
  CheckCircle,
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import api from '../api/config'

const activityIcons = {
  call: <Phone />,
  email: <Email />,
  meeting: <MeetingRoom />,
  note: <Note />,
  task: <Task />,
}

const activityColors = {
  call: 'primary',
  email: 'info',
  meeting: 'secondary',
  note: 'warning',
  task: 'success',
}

function ActivityTimeline({ leadId }) {
  const { data: activities, isLoading } = useQuery(
    ['activities', leadId],
    async () => {
      const response = await api.get(`/leads/activities/?lead_id=${leadId}`)
      return response.data.results || []
    },
  )

  if (isLoading) {
    return <LinearProgress />
  }

  if (!activities || activities.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="textSecondary">
          No activities recorded yet
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <List>
        {activities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: activityColors[activity.activity_type] + '.main',
                  }}
                >
                  {activityIcons[activity.activity_type]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {activity.activity_type.charAt(0).toUpperCase() +
                        activity.activity_type.slice(1)}
                    </Typography>
                    {activity.is_completed && (
                      <Chip
                        label="Completed"
                        size="small"
                        color="success"
                        icon={<CheckCircle />}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2">
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      By {activity.user_name || 'Unknown'} •{' '}
                      {new Date(activity.scheduled_date).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < activities.length - 1 && <Divider variant="inset" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
}

export default ActivityTimeline
