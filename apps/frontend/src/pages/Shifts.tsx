import { useState, useEffect, FormEvent } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Stack, TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, Alert, CircularProgress, List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails, Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { shiftsApi, notesApi, Shift, StructuredNote } from '../services/apiClient';

const EVENT_TYPES = [
  'Meal Preparation',
  'Personal Care',
  'Medication',
  'Mobility Assistance',
  'Housekeeping',
  'Transportation',
  'Communication',
  'Behavioral Support',
  'Other',
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}
function duration(start: string, end: string | null) {
  const ms = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Shifts() {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [pastShifts, setPastShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [eventDesc, setEventDesc] = useState('');
  const [addingEvent, setAddingEvent] = useState(false);
  const [generatingNotes, setGeneratingNotes] = useState<string | null>(null);
  const [shiftNotes, setShiftNotes] = useState<Record<string, StructuredNote>>({});

  const loadData = async () => {
    try {
      const [activeRes, allRes] = await Promise.all([
        shiftsApi.getActive(),
        shiftsApi.getAll(),
      ]);
      setActiveShift(activeRes.data.shift);
      setPastShifts(allRes.data.shifts.filter((s) => s.status === 'completed'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load shifts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleStartShift = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await shiftsApi.start();
      setActiveShift(res.data.shift);
      setSuccess('Shift started.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start shift.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await shiftsApi.end(activeShift.id);
      setPastShifts((prev) => [res.data.shift, ...prev]);
      setActiveShift(null);
      setSuccess('Shift ended successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to end shift.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeShift || !eventDesc.trim()) return;
    setAddingEvent(true);
    setError('');
    try {
      const res = await shiftsApi.addEvent(activeShift.id, eventType, eventDesc.trim());
      setActiveShift((prev) =>
        prev ? { ...prev, events: [...prev.events, res.data.event] } : prev
      );
      setEventDesc('');
      setSuccess('Event logged.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log event.');
    } finally {
      setAddingEvent(false);
    }
  };

  const handleGenerateNotes = async (shiftId: string) => {
    setGeneratingNotes(shiftId);
    setError('');
    try {
      const res = await notesApi.generate(shiftId);
      setShiftNotes((prev) => ({ ...prev, [shiftId]: res.data.note }));
      setSuccess('AI notes generated successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate notes.');
    } finally {
      setGeneratingNotes(null);
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
      <Typography variant="h4" fontWeight={700} gutterBottom>Shift Companion</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Active Shift Panel */}
      {!activeShift ? (
        <Card sx={{ mb: 4, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>No Active Shift</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Start a shift to begin logging care activities.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartShift}
              disabled={actionLoading}
              size="large"
            >
              {actionLoading ? 'Starting...' : 'Start Shift'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 4, border: '2px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600}>Active Shift</Typography>
                <Typography variant="body2" color="text.secondary">
                  Started: {formatTime(activeShift.startedAt)} · Duration: {duration(activeShift.startedAt, null)}
                </Typography>
              </Box>
              <Chip label="ACTIVE" color="success" size="small" />
            </Stack>

            {/* Log Event Form */}
            <Box component="form" onSubmit={handleAddEvent} sx={{ mb: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={eventType}
                    label="Event Type"
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    {EVENT_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Description"
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="What did you do?"
                  sx={{ flexGrow: 1 }}
                  required
                />
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  disabled={addingEvent || !eventDesc.trim()}
                  size="small"
                >
                  {addingEvent ? 'Logging...' : 'Log'}
                </Button>
              </Stack>
            </Box>

            {/* Events List */}
            {activeShift.events.length > 0 && (
              <List dense disablePadding>
                {activeShift.events.map((ev) => (
                  <ListItem key={ev.id} disableGutters>
                    <ListItemText
                      primary={ev.description}
                      secondary={`${ev.type} · ${formatTime(ev.createdAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            <Divider sx={{ my: 2 }} />
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleEndShift}
              disabled={actionLoading}
            >
              {actionLoading ? 'Ending...' : 'End Shift'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Past Shifts */}
      <Typography variant="h6" fontWeight={600} gutterBottom>Shift History</Typography>
      {pastShifts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No completed shifts yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {pastShifts.map((shift) => (
            <Card key={shift.id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatDate(shift.startedAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(shift.startedAt)} – {shift.endedAt ? formatTime(shift.endedAt) : '?'} · {duration(shift.startedAt, shift.endedAt)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`${shift.events.length} events`} size="small" variant="outlined" />
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={generatingNotes === shift.id ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon />}
                      onClick={() => handleGenerateNotes(shift.id)}
                      disabled={generatingNotes === shift.id || shift.events.length === 0}
                    >
                      {generatingNotes === shift.id ? 'Generating...' : shiftNotes[shift.id] ? 'Regenerate Notes' : 'Generate Notes'}
                    </Button>
                  </Stack>
                </Stack>

                {/* Show generated notes if available */}
                {shiftNotes[shift.id] && (
                  <Accordion sx={{ mt: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" fontWeight={600}>
                        <AutoAwesomeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle', color: 'secondary.main' }} />
                        AI-Generated Care Notes (v{shiftNotes[shift.id].promptVersion})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box component="pre" sx={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', bgcolor: 'grey.50', p: 1.5, borderRadius: 1 }}>
                        {JSON.stringify(shiftNotes[shift.id].structuredOutput, null, 2)}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Events list */}
                {shift.events.length > 0 && (
                  <List dense disablePadding sx={{ mt: 1 }}>
                    {shift.events.slice(0, 3).map((ev) => (
                      <ListItem key={ev.id} disableGutters>
                        <ListItemText
                          primary={ev.description}
                          secondary={`${ev.type} · ${formatTime(ev.createdAt)}`}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                    {shift.events.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{shift.events.length - 3} more events
                      </Typography>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
