import { useState, useEffect, FormEvent } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Stack, TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, Divider, Alert, CircularProgress, List, ListItem,
  ListItemText, Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import { shiftsApi, Shift, ShiftEvent } from '../services/apiClient';

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
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [eventDesc, setEventDesc] = useState('');
  const [addingEvent, setAddingEvent] = useState(false);

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
      await shiftsApi.end(activeShift.id);
      await loadData();
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
      const newEvent: ShiftEvent = res.data.event;
      setActiveShift((prev) =>
        prev ? { ...prev, events: [...prev.events, newEvent] } : prev
      );
      setEventDesc('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add event.');
    } finally {
      setAddingEvent(false);
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
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Shift Companion
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {activeShift ? (
        <Card sx={{ mb: 4, border: '2px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Active Shift</Typography>
                <Typography variant="body2" color="text.secondary">
                  Started {formatTime(activeShift.startedAt)} · {duration(activeShift.startedAt, null)} elapsed
                </Typography>
              </Box>
              <Chip label="ACTIVE" color="success" />
            </Stack>

            {activeShift.events.length > 0 ? (
              <Paper variant="outlined" sx={{ mb: 2, maxHeight: 260, overflow: 'auto' }}>
                <List dense>
                  {activeShift.events.map((ev, i) => (
                    <Box key={ev.id}>
                      <ListItem>
                        <ListItemText
                          primary={ev.description}
                          secondary={`${ev.type} · ${formatTime(ev.occurredAt)}`}
                        />
                      </ListItem>
                      {i < activeShift.events.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Paper>
            ) : (
              <Typography variant="body2" color="text.secondary" mb={2}>
                No events logged yet. Add your first event below.
              </Typography>
            )}

            <Box component="form" onSubmit={handleAddEvent}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={1}>
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
                  required
                  fullWidth
                  placeholder="Describe what happened..."
                />
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  disabled={addingEvent || !eventDesc.trim()}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {addingEvent ? 'Adding...' : 'Log Event'}
                </Button>
              </Stack>
            </Box>

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
      ) : (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>No Active Shift</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Start a new shift to begin logging care activities.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartShift}
              disabled={actionLoading}
              size="large"
            >
              {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Start Shift'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom>Shift History</Typography>
      {pastShifts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No completed shifts yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {pastShifts.map((shift) => (
            <Card key={shift.id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {formatDate(shift.startedAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(shift.startedAt)} – {shift.endedAt ? formatTime(shift.endedAt) : '—'}
                      {' · '}{duration(shift.startedAt, shift.endedAt)}
                      {' · '}{shift.events.length} event{shift.events.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Chip label="Completed" size="small" />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
