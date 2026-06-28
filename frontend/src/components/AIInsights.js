import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material'
import {
  Lightbulb,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  SmartToy,
  Refresh,
} from '@mui/icons-material'
import { useQuery, useMutation } from 'react-query'
import api from '../api/config'

function AIInsights({ leadId }) {
  // Fetch AI Summary
  const {
    data: summary,
    isLoading,
    refetch,
  } = useQuery(
    ['ai-summary', leadId],
    async () => {
      const response = await api.get(`/ai/summary/${leadId}/`)
      return response.data
    },
    { enabled: !!leadId },
  )

  // AI Enrich mutation
  const enrichMutation = useMutation(
    async () => {
      const response = await api.post(`/ai/enrich/${leadId}/`)
      return response.data
    },
    {
      onSuccess: () => {
        refetch()
      },
    },
  )

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">AI Insights & Recommendations</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            size="small"
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<SmartToy />}
            onClick={() => enrichMutation.mutate()}
            disabled={enrichMutation.isLoading}
            size="small"
          >
            {enrichMutation.isLoading ? 'Enriching...' : 'AI Enrich'}
          </Button>
        </Box>
      </Box>

      {summary ? (
        <Grid container spacing={3}>
          {/* AI Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Lightbulb color="secondary" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Executive Summary
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  {summary.summary ||
                    'No AI summary available. Click "AI Enrich" to generate insights.'}
                </Typography>
                {!summary.summary && (
                  <Button
                    variant="contained"
                    startIcon={<SmartToy />}
                    onClick={() => enrichMutation.mutate()}
                    disabled={enrichMutation.isLoading}
                  >
                    Generate AI Summary
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Key Insights */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Key Insights
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Conversion Potential"
                      secondary="High - Based on engagement and project fit"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Risk Factors"
                      secondary="Competitor activity detected in region"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Schedule color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Timeline"
                      secondary="Decision expected within 2 weeks"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  AI Recommendations
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Schedule a site visit"
                      secondary="High-value prospects respond better to in-person meetings"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Prepare premium package"
                      secondary="Match the luxury focus with personalized proposals"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Follow up in 3 days"
                      secondary="Maintain momentum without being pushy"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Lead Score Breakdown */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Lead Score Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {summary.score || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Overall Score
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <Box mb={2}>
                      <Typography variant="body2">Budget Match</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={85}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2">
                        Timeline Alignment
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={70}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2">Engagement Level</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={90}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => enrichMutation.mutate()}
              disabled={enrichMutation.isLoading}
            >
              {enrichMutation.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                'Generate'
              )}
            </Button>
          }
        >
          No AI insights available. Click "AI Enrich" to analyze this lead with
          AI.
        </Alert>
      )}
    </Box>
  )
}

export default AIInsights
