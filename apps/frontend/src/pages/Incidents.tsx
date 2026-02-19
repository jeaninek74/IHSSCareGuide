import NavBar from '../components/NavBar';
import { useState, useEffect, FormEvent } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Stack, TextField, Alert, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { incidentsApi, Incident } from '../services/apiClient';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadIncidents = async () => {
    try {
      const res = await incidentsApi.getAll();
      setIncidents(res.data.incidents);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadIncidents(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await incidentsApi.create(description.trim());
      setIncidents((prev) => [res.data.incident, ...prev]);
      setDescription('');
      setSuccess('Incident report submitted successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit incident.');
    } finally {
      setSubmitting(false);
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
    <>
      <NavBar />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Incident Reports</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Document incidents for your records. AI-assisted structuring will be available in a future update.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>New Incident Report</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Describe the incident"
              multiline
              rows={4}
              fullWidth
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, when it occurred, who was involved, and any actions taken..."
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={submitting || !description.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" fontWeight={600} gutterBottom>Incident History</Typography>
      {incidents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No incidents reported yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {incidents.map((incident) => (
            <Card key={incident.id} variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  {formatDateTime(incident.createdAt)}
                </Typography>
                <Typography variant="body1">{incident.description}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
    </>
  );
}
