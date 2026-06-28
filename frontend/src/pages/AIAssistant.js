import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material'
import { Send, SmartToy, Person, Lightbulb } from '@mui/icons-material'
import { useMutation } from 'react-query'
import api from '../api/config'

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 Hello! I'm your AI CRM Assistant. I can help you with leads, follow-ups, properties, and competitors. Try asking me something!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Suggested questions
  const suggestedQuestions = [
    // Lead Related
    'How many leads do I have?',
    'Show me my won leads',
    "What's my conversion rate?",
    'Show lead breakdown',
    'Show new leads',
    'Show qualified leads',
    'What should I do next?',
    // Follow-up Related
    'What leads need follow-up today?',
    'Show me my follow-ups',
    'Upcoming reminders',
    // Property Related
    'Show me properties',
    'How many properties are available?',
    'Property inventory',
    // Competitor Related
    'Show me competitors',
    'Competitor analysis',
    'Who are my competitors?',
  ]

  const chatMutation = useMutation(async (query) => {
    const response = await api.post('/ai/chat/', { query })
    return response.data
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatMutation.mutateAsync(input)
      const assistantMessage = {
        role: 'assistant',
        content:
          response.response ||
          'I processed your request. How can I help further?',
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (query) => {
    setInput(query)
    // Send immediately
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Assistant
      </Typography>

      <Grid container spacing={3}>
        {/* Main Chat */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}
          >
            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent:
                      message.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      display: 'flex',
                      gap: 2,
                      flexDirection:
                        message.role === 'user' ? 'row-reverse' : 'row',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor:
                          message.role === 'user'
                            ? 'primary.main'
                            : 'secondary.main',
                      }}
                    >
                      {message.role === 'user' ? <Person /> : <SmartToy />}
                    </Avatar>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor:
                          message.role === 'user' ? 'primary.main' : 'grey.100',
                        color:
                          message.role === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        maxWidth: '100%',
                        overflow: 'auto',
                      }}
                    >
                      <Typography
                        variant="body1"
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {message.content}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              ))}
              {isLoading && (
                <Box display="flex" justifyContent="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="textSecondary">
                      Thinking...
                    </Typography>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Ask anything about your leads, properties, or competitors..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  <Send />
                </IconButton>
              </Box>
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary">
                  Try asking: "Show me competitors", "What leads need
                  follow-up?", "How many properties are available?"
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Questions
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {/* Lead Questions */}
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                📊 Leads
              </Typography>
              {suggestedQuestions.slice(0, 6).map((action, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleQuickAction(action)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                  }}
                >
                  <Lightbulb
                    sx={{ mr: 1, fontSize: 16, color: 'warning.main' }}
                  />
                  {action}
                </Button>
              ))}

              {/* Follow-up Questions */}
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                ⏰ Follow-ups
              </Typography>
              {suggestedQuestions.slice(6, 9).map((action, index) => (
                <Button
                  key={index + 6}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleQuickAction(action)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                  }}
                >
                  <Lightbulb
                    sx={{ mr: 1, fontSize: 16, color: 'warning.main' }}
                  />
                  {action}
                </Button>
              ))}

              {/* Property Questions */}
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                🏠 Properties
              </Typography>
              {suggestedQuestions.slice(9, 12).map((action, index) => (
                <Button
                  key={index + 9}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleQuickAction(action)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                  }}
                >
                  <Lightbulb
                    sx={{ mr: 1, fontSize: 16, color: 'warning.main' }}
                  />
                  {action}
                </Button>
              ))}

              {/* Competitor Questions */}
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                📊 Competitors
              </Typography>
              {suggestedQuestions.slice(12, 15).map((action, index) => (
                <Button
                  key={index + 12}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleQuickAction(action)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                  }}
                >
                  <Lightbulb
                    sx={{ mr: 1, fontSize: 16, color: 'warning.main' }}
                  />
                  {action}
                </Button>
              ))}
            </Box>
          </Paper>

          {/* Quick Stats */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              💡 Quick Tips
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              • Ask about specific lead statuses
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              • Check follow-ups for today
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              • Get competitor insights
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              • Track property inventory
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AIAssistant
