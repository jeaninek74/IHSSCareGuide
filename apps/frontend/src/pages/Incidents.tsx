import NavBar from '../components/NavBar';
import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Stack, TextField, Alert, CircularProgress, Chip, Divider,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { incidentsApi, Incident } from '../services/apiClient';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface IncidentStructured {
  summary: string;
  timeline: string;
  involvedParties: string[];
  actionsTaken: string[];
  recommendedFollowUp: string;
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [structuring, setStructuring] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadIncidents = () => {
    incidentsApi.getAll()
      .then((res) => setIncidents(res.data.incidents))
      .catch(() => setError('Failed to load incidents.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadIncidents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await incidentsApi.create(description.trim());
      setIncidents((prev) => [res.data.incident, ...prev]);
      setDescription('');
      setSuccess('Incident report submitted.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit incident.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStructure = async (incidentId: string) => {
    setStructuring(incidentId);
    setError('');
    try {
      const res = await incidentsApi.structure(incidentId);
      setIncidents((prev) =>
        prev.map((inc) => inc.id === incidentId ? res.data.incident : inc)
      );
      setSuccess('AI structuring complete.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'AI structuring failed. Please try again.');
    } finally {
      setStructuring(null);
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
          Document incidents for your records. Use AI structuring to convert raw notes into a professional incident report.
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
            {incidents.map((incident) => {
              const structured = incident.structuredJson as IncidentStructured | null;
              return (
                <Card key={incident.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <WarningAmberIcon fontSize="small" color="warning" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(incident.createdAt)}
                        </Typography>
                        {structured && (
                          <Chip
                            label="AI Structured"
                            size="small"
                            color="primary"
                            variant="outlined"
                            icon={<AutoAwesomeIcon />}
                          />
                        )}
                      </Stack>
                      {!structured && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={structuring === incident.id
                            ? <CircularProgress size={14} />
                            : <AutoAwesomeIcon />}
                          onClick={() => handleStructure(incident.id)}
                          disabled={structuring === incident.id}
                          sx={{ flexShrink: 0, ml: 1 }}
                        >
                          {structuring === incident.id ? 'Structuring...' : 'AI Structure'}
                        </Button>
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: structured ? 2 : 0 }}>
                      {incident.description}
                    </Typography>

                    {structured && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
                            <Typography variant="body2" fontWeight={600}>
                              <AutoAwesomeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle', color: 'primary.main' }} />
                              AI Structured Report
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ px: 2, pt: 0 }}>
                            <Stack spacing={1.5}>
                              <Box>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">SUMMARY</Typography>
                                <Typography variant="body2">{structured.summary}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">TIMELINE</Typography>
                                <Typography variant="body2">{structured.timeline}</Typography>
                              </Box>
                              {structured.involvedParties?.length > 0 && (
                                <Box>
                                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">INVOLVED PARTIES</Typography>
                                  <List dense disablePadding>
                                    {structured.involvedParties.map((p, i) => (
                                      <ListItem key={i} disablePadding sx={{ pl: 1 }}>
                                        <ListItemText primary={`• ${p}`} primaryTypographyProps={{ variant: 'body2' }} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                              {structured.actionsTaken?.length > 0 && (
                                <Box>
                                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">ACTIONS TAKEN</Typography>
                                  <List dense disablePadding>
                                    {structured.actionsTaken.map((a, i) => (
                                      <ListItem key={i} disablePadding sx={{ pl: 1 }}>
                                        <ListItemText primary={`• ${a}`} primaryTypographyProps={{ variant: 'body2' }} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                              <Box>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">RECOMMENDED FOLLOW-UP</Typography>
                                <Typography variant="body2">{structured.recommendedFollowUp}</Typography>
                              </Box>
                              {incident.modelUsed && (
                                <Typography variant="caption" color="text.disabled">
                                  Generated by {incident.modelUsed} · Prompt v{incident.promptVersion}
                                </Typography>
                              )}
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                        <Box mt={1.5}>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={structuring === incident.id
                              ? <CircularProgress size={12} />
                              : <AutoAwesomeIcon />}
                            onClick={() => handleStructure(incident.id)}
                            disabled={structuring === incident.id}
                            color="secondary"
                          >
                            Re-structure
                          </Button>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </>
  );
}
