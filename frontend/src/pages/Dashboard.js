import React, { useState, useEffect } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  People,
  TrendingUp,
  AttachMoney,
  CheckCircle,
  Login,
  EventNote,
  Comment,
  Schedule,
  NotificationsActive,
  Today,
  CalendarToday,
  DateRange,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, formatDistanceToNow } from 'date-fns'
import api from '../api/config'
import { useAuth } from '../hooks/useAuth'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activityFilter, setActivityFilter] = useState('daily')

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats/')
      console.log('Dashboard stats:', response.data)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setActivityFilter(newFilter)
    }
  }

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    )
  }

  if (!stats) {
    return <Typography>Error loading dashboard data</Typography>
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  )

  const getActivityData = () => {
    if (activityFilter === 'daily') return stats.daily_activity || []
    if (activityFilter === 'weekly') return stats.weekly_activity || []
    if (activityFilter === 'monthly') return stats.monthly_activity || []
    return stats.daily_activity || []
  }

  const getActivityLabel = () => {
    if (activityFilter === 'daily') return 'Today (Hourly)'
    if (activityFilter === 'weekly') return 'This Week (Daily)'
    if (activityFilter === 'monthly') return 'This Month (Daily)'
    return 'Today'
  }

  const getXAxisKey = () => {
    if (activityFilter === 'daily') return 'hour'
    if (activityFilter === 'weekly') return 'day'
    if (activityFilter === 'monthly') return 'day'
    return 'hour'
  }

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  const activityData = getActivityData()
  const xAxisKey = getXAxisKey()

  // Get the maximum count for Y-axis
  const maxCount = Math.max(...activityData.map((item) => item.count || 0), 1)

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="body2" color="textSecondary">
          Welcome back, {user?.first_name || user?.username || 'User'}!
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Leads"
            value={stats.total_leads}
            icon={<People />}
            color="#1a237e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Today"
            value={stats.new_leads_today}
            icon={<TrendingUp />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Won"
            value={stats.won_leads}
            icon={<CheckCircle />}
            color="#1976d2"
            subtitle={`${stats.conversion_rate}% conversion rate`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Estimated Revenue"
            value={`₹${(stats.estimated_revenue / 10000000).toFixed(1)}Cr`}
            icon={<AttachMoney />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">
                Lead Activity - {getActivityLabel()}
              </Typography>
              <ToggleButtonGroup
                value={activityFilter}
                exclusive
                onChange={handleFilterChange}
                size="small"
              >
                <ToggleButton value="daily" aria-label="daily">
                  <Today fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    Daily
                  </Typography>
                </ToggleButton>
                <ToggleButton value="weekly" aria-label="weekly">
                  <DateRange fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    Weekly
                  </Typography>
                </ToggleButton>
                <ToggleButton value="monthly" aria-label="monthly">
                  <CalendarToday fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    Monthly
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {activityData.length > 0 &&
            activityData.some((item) => item.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={activityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={xAxisKey}
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={activityFilter === 'monthly' ? -45 : 0}
                    textAnchor={activityFilter === 'monthly' ? 'end' : 'middle'}
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                    domain={[0, maxCount + 1]}
                  />
                  <RechartTooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1a237e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={300}
              >
                <Typography variant="body1" color="textSecondary">
                  No leads created yet for this period
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Status
            </Typography>
            <Box>
              {stats.status_distribution?.map((item, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent="space-between"
                  py={1}
                  borderBottom="1px solid #eee"
                >
                  <Typography
                    variant="body2"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {item.status}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Three Column Layout */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Recent Login Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Login color="primary" />
              <Typography variant="h6">Recent Logins</Typography>
            </Box>
            <List>
              {stats.login_activity?.length > 0 ? (
                stats.login_activity.slice(0, 5).map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: activity.is_active
                              ? 'success.main'
                              : 'error.main',
                          }}
                        >
                          {activity.first_name?.[0] ||
                            activity.user?.[0] ||
                            'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          activity.first_name
                            ? `${activity.first_name} ${activity.last_name || ''}`
                            : activity.user
                        }
                        secondary={
                          <>
                            <Typography variant="caption" color="textSecondary">
                              {activity.login_time
                                ? getTimeAgo(activity.login_time)
                                : 'Just now'}
                            </Typography>
                         
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                  py={2}
                >
                  No recent logins
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Latest Notes */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Comment color="secondary" />
              <Typography variant="h6">Latest Notes</Typography>
            </Box>
            <List>
              {stats.latest_notes?.length > 0 ? (
                stats.latest_notes.slice(0, 5).map((note, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <EventNote />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={note.title}
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ maxWidth: 180 }}
                            >
                              {note.content?.substring(0, 60)}...
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {note.lead_name} • {getTimeAgo(note.created_at)}
                            </Typography>
                            {note.note_type === 'follow_up' &&
                              note.scheduled_date && (
                                <Chip
                                  icon={<Schedule fontSize="small" />}
                                  label={`Follow-up: ${new Date(note.scheduled_date).toLocaleDateString()}`}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                  py={2}
                >
                  No notes yet
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Follow-ups */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Schedule color="warning" />
              <Typography variant="h6">Upcoming Follow-ups</Typography>
            </Box>
            <List>
              {stats.upcoming_followups?.length > 0 ? (
                stats.upcoming_followups.slice(0, 5).map((followup, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <NotificationsActive />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={followup.lead_name || 'Unknown Lead'}
                        secondary={
                          <>
                            <Typography variant="body2" noWrap>
                              {followup.description?.substring(0, 60) ||
                                followup.title ||
                                'No description'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              <Schedule fontSize="inherit" sx={{ mr: 0.5 }} />
                              {followup.scheduled_date
                                ? format(
                                    new Date(followup.scheduled_date),
                                    'dd MMM yyyy, hh:mm a',
                                  )
                                : 'No date set'}
                            </Typography>
                            {followup.source === 'note' && (
                              <Chip
                                label="From Note"
                                size="small"
                                sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                              />
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                  py={2}
                >
                  No upcoming follow-ups
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
