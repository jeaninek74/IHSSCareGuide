import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Stack, TextField, Alert, CircularProgress, Chip, Divider,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText,
  IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import NavBar from '../components/NavBar';
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCopyIncident = async (incident: Incident, structured: IncidentStructured) => {
    const text = [
      `INCIDENT REPORT — ${formatDateTime(incident.createdAt)}`,
      '',
      `DESCRIPTION:\n${incident.description}`,
      '',
      `SUMMARY:\n${structured.summary}`,
      '',
      `TIMELINE:\n${structured.timeline}`,
      structured.involvedParties?.length ? `\nINVOLVED PARTIES:\n${structured.involvedParties.map((p) => `• ${p}`).join('\n')}` : '',
      structured.actionsTaken?.length ? `\nACTIONS TAKEN:\n${structured.actionsTaken.map((a) => `• ${a}`).join('\n')}` : '',
      '',
      `RECOMMENDED FOLLOW-UP:\n${structured.recommendedFollowUp}`,
    ].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedId(incident.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrintIncident = (incident: Incident, structured: IncidentStructured) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Incident Report</title><style>body{font-family:sans-serif;padding:24px;max-width:700px;margin:auto}h2,h3{margin-bottom:4px}p,li{font-size:14px}ul{margin:4px 0 12px 16px}</style></head><body>`);
    win.document.write(`<h2>Incident Report</h2><p><strong>Date:</strong> ${formatDateTime(incident.createdAt)}</p>`);
    win.document.write(`<h3>Description</h3><p>${incident.description}</p>`);
    win.document.write(`<h3>Summary</h3><p>${structured.summary}</p>`);
    win.document.write(`<h3>Timeline</h3><p>${structured.timeline}</p>`);
    if (structured.involvedParties?.length) win.document.write(`<h3>Involved Parties</h3><ul>${structured.involvedParties.map((p) => `<li>${p}</li>`).join('')}</ul>`);
    if (structured.actionsTaken?.length) win.document.write(`<h3>Actions Taken</h3><ul>${structured.actionsTaken.map((a) => `<li>${a}</li>`).join('')}</ul>`);
    win.document.write(`<h3>Recommended Follow-Up</h3><p>${structured.recommendedFollowUp}</p>`);
    win.document.write(`</body></html>`);
    win.document.close();
    win.print();
  };

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
                            <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" pr={1}>
                              <Typography variant="body2" fontWeight={600}>
                                <AutoAwesomeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle', color: 'primary.main' }} />
                                AI Structured Report
                              </Typography>
                              <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
                                <Tooltip title={copiedId === incident.id ? 'Copied!' : 'Copy report'}>
                                  <IconButton size="small" onClick={() => handleCopyIncident(incident, structured)}>
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Print report">
                                  <IconButton size="small" onClick={() => handlePrintIncident(incident, structured)}>
                                    <PrintIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>
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
