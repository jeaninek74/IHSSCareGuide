import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Stack, Alert, CircularProgress, TextField, Accordion,
  AccordionSummary, AccordionDetails, Chip, Divider,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { exportsApi, WeeklyExport } from '../services/apiClient';

function getLastWeekBounds(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const day = now.getDay();
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - day - 7);
  const lastSaturday = new Date(lastSunday);
  lastSaturday.setDate(lastSunday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { weekStart: fmt(lastSunday), weekEnd: fmt(lastSaturday) };
}

function formatWeekRange(start: string, end: string) {
  const s = new Date(start + 'T12:00:00Z');
  const e = new Date(end + 'T12:00:00Z');
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

interface WeeklySummary {
  weekRange: string;
  totalHours: number;
  days: Array<{
    date: string;
    shifts: Array<{
      shiftId: string;
      startedAt: string;
      endedAt: string;
      hours: number;
      highlights: string[];
    }>;
    totalHours: number;
  }>;
  submissionChecklist: string[];
}

export default function Exports() {
  const [exports, setExports] = useState<WeeklyExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const bounds = getLastWeekBounds();
  const [weekStart, setWeekStart] = useState(bounds.weekStart);
  const [weekEnd, setWeekEnd] = useState(bounds.weekEnd);
  const [latestSummary, setLatestSummary] = useState<WeeklySummary | null>(null);

  useEffect(() => {
    exportsApi.getAll()
      .then((res) => setExports(res.data.exports))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load exports.'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');
    setLatestSummary(null);
    try {
      const res = await exportsApi.generateWeekly(weekStart, weekEnd);
      setLatestSummary(res.data.summary as unknown as WeeklySummary);
      setExports((prev) => [res.data.export, ...prev]);
      setSuccess('Weekly summary generated successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate weekly summary.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Weekly Export</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Generate a structured weekly summary to prepare for manual ESP timesheet submission.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Generate Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
            Generate Weekly Summary
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end" mb={2}>
            <TextField
              label="Week Start (Sunday)"
              type="date"
              size="small"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Week End (Saturday)"
              type="date"
              size="small"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={handleGenerate}
              disabled={generating || !weekStart || !weekEnd}
            >
              {generating ? 'Generating...' : 'Generate Summary'}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Selected week: {weekStart && weekEnd ? formatWeekRange(weekStart, weekEnd) : '—'}
          </Typography>
        </CardContent>
      </Card>

      {/* Latest Generated Summary */}
      {latestSummary && (
        <Card sx={{ mb: 4, border: '2px solid', borderColor: 'secondary.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                <AutoAwesomeIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle', color: 'secondary.main' }} />
                {latestSummary.weekRange}
              </Typography>
              <Chip label={`${latestSummary.totalHours} hrs total`} color="secondary" size="small" />
            </Stack>

            {latestSummary.days && latestSummary.days.length > 0 && (
              <Stack spacing={1} mb={2}>
                {latestSummary.days.map((day) => (
                  <Box key={day.date} sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(day.date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      {' '}— {day.totalHours} hrs
                    </Typography>
                    {day.shifts.map((s) => (
                      <Box key={s.shiftId} pl={2} mt={0.5}>
                        {s.highlights.map((h, i) => (
                          <Typography key={i} variant="caption" display="block" color="text.secondary">• {h}</Typography>
                        ))}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Stack>
            )}

            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" fontWeight={600} mb={1}>ESP Submission Checklist:</Typography>
            {latestSummary.submissionChecklist?.map((item, i) => (
              <Typography key={i} variant="body2" color="text.secondary">✓ {item}</Typography>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Export History */}
      <Typography variant="h6" fontWeight={600} gutterBottom>Export History</Typography>
      {exports.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No exports generated yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {exports.map((exp) => (
            <Accordion key={exp.id} variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" fontWeight={600}>
                    {formatWeekRange(exp.weekStart.split('T')[0], exp.weekEnd.split('T')[0])}
                  </Typography>
                  <Chip label={`v${exp.promptVersion}`} size="small" variant="outlined" />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(exp.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="pre" sx={{ fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word', bgcolor: 'grey.50', p: 1.5, borderRadius: 1 }}>
                  {JSON.stringify(exp.structuredOutput, null, 2)}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Container>
  );
}
