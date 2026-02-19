import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import NavBar from '../components/NavBar';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Source {
  documentTitle: string;
  source: string;
  snippet: string;
}

interface AssistantAnswer {
  answer: string;
  sources: Source[];
  verificationReminder: string;
  confidence: 'high' | 'low';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  answer?: AssistantAnswer;
  timestamp: Date;
}

// ── Suggested Questions ───────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  'How do I submit my timesheet through ESP?',
  'What activities are covered under IHSS?',
  'How many hours can an IHSS caregiver work per week?',
  'What should I do if my recipient has a medical emergency?',
  'How do I report a change in my recipient\'s condition?',
  'What is the IHSS pay period schedule?',
];

// ── API ───────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

async function askAssistant(question: string): Promise<AssistantAnswer> {
  const res = await fetch(`${API_BASE}/knowledge/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ question }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to get answer');
  }
  return data.data.answer as AssistantAnswer;
}

// ── Source Card ───────────────────────────────────────────────────────────────

function SourceCard({ source }: { source: Source }) {
  const [open, setOpen] = useState(false);
  return (
    <Paper variant="outlined" sx={{ mb: 0.5, p: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" fontWeight={600} color="primary">
          {source.documentTitle}
        </Typography>
        <IconButton size="small" onClick={() => setOpen(!open)}>
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {source.source}
      </Typography>
      <Collapse in={open}>
        <Typography variant="caption" sx={{ mt: 0.5, fontStyle: 'italic', display: 'block' }}>
          &ldquo;{source.snippet}&rdquo;
        </Typography>
      </Collapse>
    </Paper>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);
  const answer = message.answer;

  return (
    <Box
      display="flex"
      flexDirection={isUser ? 'row-reverse' : 'row'}
      alignItems="flex-start"
      gap={1}
      mb={2}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        {isUser ? (
          <PersonIcon sx={{ fontSize: 18, color: 'white' }} />
        ) : (
          <SmartToyIcon sx={{ fontSize: 18, color: 'white' }} />
        )}
      </Box>

      <Box maxWidth="80%">
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: isUser ? 'primary.light' : 'grey.100',
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>

          {answer && answer.confidence === 'low' && (
            <Alert severity="warning" sx={{ mt: 1, py: 0 }} icon={<InfoOutlinedIcon fontSize="small" />}>
              <Typography variant="caption">Low confidence — please verify with official sources.</Typography>
            </Alert>
          )}

          {answer && answer.verificationReminder && (
            <Typography variant="caption" color="text.secondary" display="block" mt={1} fontStyle="italic">
              {answer.verificationReminder}
            </Typography>
          )}
        </Paper>

        {answer && answer.sources && answer.sources.length > 0 && (
          <Box mt={0.5}>
            <Button
              size="small"
              variant="text"
              onClick={() => setShowSources(!showSources)}
              startIcon={showSources ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ fontSize: '0.7rem', p: 0.5 }}
            >
              {showSources ? 'Hide' : 'Show'} {answer.sources.length} source{answer.sources.length > 1 ? 's' : ''}
            </Button>
            <Collapse in={showSources}>
              <Box mt={0.5}>
                {answer.sources.map((src, i) => (
                  <SourceCard key={i} source={src} />
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={0.5}
          textAlign={isUser ? 'right' : 'left'}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Assistant() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm your IHSS Caregiver Assistant. I can answer questions about IHSS rules, ESP timesheets, care documentation, and caregiver workflows.\n\nPlease note: I provide information based on official IHSS and ESP documentation. Always verify important decisions with your county IHSS office or official resources.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || loading) return;

    setInput('');
    setError('');

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const answer = await askAssistant(q);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer.answer,
        answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <NavBar />
      <Container
        maxWidth="md"
        sx={{
          py: { xs: 1, sm: 3 },
          px: { xs: 1, sm: 3 },
          height: { xs: 'calc(100vh - 56px - 64px)', sm: 'calc(100vh - 64px)' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
      {/* Header */}
        <Box mb={{ xs: 1, sm: 2 }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} gutterBottom>
          IHSS Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ask questions about IHSS rules, ESP timesheets, and caregiver documentation. Answers are
          grounded in official IHSS and ESP resources.
        </Typography>
      </Box>

      {/* Suggested Questions (only shown at start) */}
      {messages.length <= 1 && (
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            SUGGESTED QUESTIONS
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.75}>
            {SUGGESTED_QUESTIONS.map((q) => (
              <Chip
                key={q}
                label={q}
                size="small"
                variant="outlined"
                onClick={() => handleSend(q)}
                sx={{ cursor: 'pointer', fontSize: '0.72rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Chat Messages */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          mb: 2,
          bgcolor: 'background.default',
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SmartToyIcon sx={{ fontSize: 18, color: 'white' }} />
            </Box>
            <Paper
              elevation={0}
              sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: '4px 16px 16px 16px' }}
            >
              <CircularProgress size={16} />
              <Typography variant="caption" ml={1}>
                Searching knowledge base...
              </Typography>
            </Paper>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div ref={bottomRef} />
      </Paper>

      {/* Input Area */}
      <Box>
        <Divider sx={{ mb: 1.5 }} />
        <Box display="flex" gap={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask about IHSS rules, ESP timesheets, care documentation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            size="small"
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            endIcon={<SendIcon />}
            sx={{ minWidth: 100, height: 40 }}
          >
            Send
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          Press Enter to send · Shift+Enter for new line
        </Typography>
      </Box>
    </Container>
    </>
  );
}
