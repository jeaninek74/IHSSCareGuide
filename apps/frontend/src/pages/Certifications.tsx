import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent,
  Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Alert, CircularProgress, Divider, IconButton, Tooltip,
  Accordion, AccordionSummary, AccordionDetails, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import NavBar from '../components/NavBar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface CertificationType {
  id: string;
  name: string;
  description?: string;
  defaultValidityDays?: number;
  isCommon: boolean;
}

interface ProviderCertification {
  id: string;
  certificationTypeId?: string;
  customName?: string;
  issuedDate?: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'expiring_soon' | 'missing';
  notes?: string;
  certificationType?: CertificationType;
}

interface Summary {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
  missing: number;
}

interface GuidanceResult {
  classification: 'required' | 'recommended' | 'optional';
  plainLanguageExplanation: string;
  whatToDoNext: string;
  verificationReminder: string;
  confidence: 'high' | 'low';
  sources: Array<{ title: string; source: string; snippet: string }>;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'expiring_soon': return 'warning';
    case 'expired': return 'error';
    case 'missing': return 'default';
    default: return 'default';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircleIcon fontSize="small" />;
    case 'expiring_soon': return <WarningAmberIcon fontSize="small" />;
    case 'expired': return <ErrorIcon fontSize="small" />;
    default: return null;
  }
};

const classificationColor = (c: string) => {
  if (c === 'required') return '#d32f2f';
  if (c === 'recommended') return '#ed6c02';
  return '#2e7d32';
};

export default function Certifications() {
  const [certs, setCerts] = useState<ProviderCertification[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [certTypes, setCertTypes] = useState<CertificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<ProviderCertification | null>(null);
  const [formTypeId, setFormTypeId] = useState('');
  const [formCustomName, setFormCustomName] = useState('');
  const [formIssuedDate, setFormIssuedDate] = useState('');
  const [formExpirationDate, setFormExpirationDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // AI Guidance
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [guidanceCert, setGuidanceCert] = useState<ProviderCertification | null>(null);
  const [guidanceQuestion, setGuidanceQuestion] = useState('');
  const [guidanceCounty, setGuidanceCounty] = useState('');
  const [guidanceResult, setGuidanceResult] = useState<GuidanceResult | null>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [certsRes, typesRes] = await Promise.all([
        fetch(`${API_BASE}/certifications${filterStatus ? `?status=${filterStatus}` : ''}`, { credentials: 'include' }),
        fetch(`${API_BASE}/certifications/types`, { credentials: 'include' }),
      ]);
      const certsData = await certsRes.json();
      const typesData = await typesRes.json();
      if (certsData.success) {
        setCerts(certsData.data.certifications);
        setSummary(certsData.data.summary);
      }
      if (typesData.success) setCertTypes(typesData.data.types);
    } catch {
      setError('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAddDialog = () => {
    setEditingCert(null);
    setFormTypeId(''); setFormCustomName(''); setFormIssuedDate('');
    setFormExpirationDate(''); setFormNotes(''); setFormError('');
    setDialogOpen(true);
  };

  const openEditDialog = (cert: ProviderCertification) => {
    setEditingCert(cert);
    setFormTypeId(cert.certificationTypeId || '');
    setFormCustomName(cert.customName || '');
    setFormIssuedDate(cert.issuedDate ? cert.issuedDate.split('T')[0] : '');
    setFormExpirationDate(cert.expirationDate ? cert.expirationDate.split('T')[0] : '');
    setFormNotes(cert.notes || '');
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTypeId && !formCustomName.trim()) {
      setFormError('Please select a certification type or enter a custom name.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const body: Record<string, string | undefined> = {
        certificationTypeId: formTypeId || undefined,
        customName: formCustomName || undefined,
        issuedDate: formIssuedDate ? new Date(formIssuedDate).toISOString() : undefined,
        expirationDate: formExpirationDate ? new Date(formExpirationDate).toISOString() : undefined,
        notes: formNotes || undefined,
      };
      const url = editingCert
        ? `${API_BASE}/certifications/${editingCert.id}`
        : `${API_BASE}/certifications`;
      const method = editingCert ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Save failed');
      setDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this certification?')) return;
    await fetch(`${API_BASE}/certifications/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchData();
  };

  const openGuidance = (cert: ProviderCertification) => {
    setGuidanceCert(cert);
    setGuidanceQuestion('');
    setGuidanceCounty('');
    setGuidanceResult(null);
    setGuidanceError('');
    setGuidanceOpen(true);
  };

  const handleGetGuidance = async () => {
    if (!guidanceCert) return;
    setGuidanceLoading(true);
    setGuidanceError('');
    try {
      const certName = guidanceCert.certificationType?.name || guidanceCert.customName || '';
      const res = await fetch(`${API_BASE}/ai/training-guidance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          certificationName: certName,
          county: guidanceCounty || undefined,
          question: guidanceQuestion || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || 'Guidance failed');
      setGuidanceResult(data.data.guidance);
    } catch (err: unknown) {
      setGuidanceError(err instanceof Error ? err.message : 'Failed to get guidance');
    } finally {
      setGuidanceLoading(false);
    }
  };

  const certName = (cert: ProviderCertification) =>
    cert.certificationType?.name || cert.customName || 'Unknown';

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Certifications & Training</Typography>
            <Typography variant="body2" color="text.secondary">
              Track your IHSS certifications, expiration dates, and training requirements
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
            Add Certification
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total', value: summary.total, color: '#1976d2' },
              { label: 'Active', value: summary.active, color: '#2e7d32' },
              { label: 'Expiring Soon', value: summary.expiringSoon, color: '#ed6c02' },
              { label: 'Expired', value: summary.expired, color: '#d32f2f' },
            ].map((s) => (
              <Grid item xs={6} sm={3} key={s.label}>
                <Card sx={{ textAlign: 'center', borderTop: `4px solid ${s.color}` }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Filter */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['', 'active', 'expiring_soon', 'expired'].map((s) => (
            <Chip
              key={s || 'all'}
              label={s === '' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              onClick={() => setFilterStatus(s)}
              color={filterStatus === s ? 'primary' : 'default'}
              variant={filterStatus === s ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {/* Certifications List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : certs.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No certifications found. Add your first certification to get started.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {certs.map((cert) => (
              <Grid item xs={12} md={6} key={cert.id}>
                <Card sx={{ height: '100%', border: cert.status === 'expired' ? '1px solid #d32f2f' : cert.status === 'expiring_soon' ? '1px solid #ed6c02' : undefined }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" fontWeight={600}>{certName(cert)}</Typography>
                      <Chip
                        label={cert.status.replace('_', ' ')}
                        color={statusColor(cert.status) as any}
                        size="small"
                        icon={statusIcon(cert.status) || undefined}
                      />
                    </Box>
                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Issued</Typography>
                        <Typography variant="body2">{formatDate(cert.issuedDate)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Expires</Typography>
                        <Typography variant="body2" color={cert.status === 'expired' ? 'error' : cert.status === 'expiring_soon' ? 'warning.main' : 'text.primary'}>
                          {formatDate(cert.expirationDate)}
                        </Typography>
                      </Grid>
                    </Grid>
                    {cert.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                        {cert.notes}
                      </Typography>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="AI Guidance — Explain this requirement">
                        <IconButton size="small" color="primary" onClick={() => openGuidance(cert)}>
                          <PsychologyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditDialog(cert)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(cert.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingCert ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Certification Type</InputLabel>
              <Select
                value={formTypeId}
                label="Certification Type"
                onChange={(e) => { setFormTypeId(e.target.value); if (e.target.value) setFormCustomName(''); }}
              >
                <MenuItem value="">Custom / Other</MenuItem>
                {certTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!formTypeId && (
              <TextField
                fullWidth label="Custom Certification Name" value={formCustomName}
                onChange={(e) => setFormCustomName(e.target.value)}
                sx={{ mb: 2 }} required
              />
            )}
            <TextField
              fullWidth label="Issued Date" type="date" value={formIssuedDate}
              onChange={(e) => setFormIssuedDate(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Expiration Date" type="date" value={formExpirationDate}
              onChange={(e) => setFormExpirationDate(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Notes (optional)" multiline rows={3} value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" disabled={formLoading}>
              {formLoading ? <CircularProgress size={20} /> : editingCert ? 'Save Changes' : 'Add Certification'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* AI Guidance Dialog */}
        <Dialog open={guidanceOpen} onClose={() => setGuidanceOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="primary" />
            AI Training Guidance — {guidanceCert ? certName(guidanceCert) : ''}
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              AI responses are grounded in IHSS knowledge sources. Always verify with your county IHSS office before taking action.
            </Alert>
            <TextField
              fullWidth label="Your County (optional)" value={guidanceCounty}
              onChange={(e) => setGuidanceCounty(e.target.value)}
              placeholder="e.g. Los Angeles" sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Specific question (optional)" multiline rows={2} value={guidanceQuestion}
              onChange={(e) => setGuidanceQuestion(e.target.value)}
              placeholder="e.g. Is this required for registry providers? How do I renew it?"
              sx={{ mb: 2 }}
            />
            {guidanceError && <Alert severity="error" sx={{ mb: 2 }}>{guidanceError}</Alert>}
            {guidanceResult && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    label={guidanceResult.classification.toUpperCase()}
                    sx={{ bgcolor: classificationColor(guidanceResult.classification), color: 'white', fontWeight: 700 }}
                  />
                  <Chip
                    label={`Confidence: ${guidanceResult.confidence}`}
                    color={guidanceResult.confidence === 'high' ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body1" sx={{ mb: 2 }}>{guidanceResult.plainLanguageExplanation}</Typography>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>What to do next:</Typography>
                  <Typography variant="body2">{guidanceResult.whatToDoNext}</Typography>
                </Paper>
                <Alert severity="warning" sx={{ mb: 2 }}>{guidanceResult.verificationReminder}</Alert>
                {guidanceResult.sources.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" fontWeight={600}>Sources ({guidanceResult.sources.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {guidanceResult.sources.map((s, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{s.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.source}</Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>{s.snippet}</Typography>
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGuidanceOpen(false)}>Close</Button>
            <Button
              onClick={handleGetGuidance}
              variant="contained"
              disabled={guidanceLoading}
              startIcon={guidanceLoading ? <CircularProgress size={16} /> : <PsychologyIcon />}
            >
              {guidanceLoading ? 'Analyzing...' : guidanceResult ? 'Ask Again' : 'Explain This Requirement'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
