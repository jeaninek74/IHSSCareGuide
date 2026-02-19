import { useState } from 'react';
import {
  Box, Container, Typography, Card, CardContent, TextField,
  Button, Alert, CircularProgress, Stack, Divider, Avatar,
  MenuItem, Select, InputLabel, FormControl, SelectChangeEvent,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/apiClient';

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Phoenix', label: 'Arizona Time (AZ)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HI)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AK)' },
];

export default function Profile() {
  const { user, profile, refreshUser } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'America/Los_Angeles');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authApi.updateProfile({ name: name.trim(), timezone });
      await refreshUser();
      setSuccess('Profile updated successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <NavBar />
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
          <AccountCircleIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>Account Settings</Typography>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Account info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52, fontSize: 22 }}>
                {profile?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={600}>{profile?.name || 'No name set'}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Box component="form" onSubmit={handleSave}>
              <Stack spacing={2}>
                <TextField
                  label="Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  inputProps={{ maxLength: 100 }}
                  helperText="Your name as it appears in the app"
                />
                <FormControl fullWidth>
                  <InputLabel id="tz-label">Timezone</InputLabel>
                  <Select
                    labelId="tz-label"
                    value={timezone}
                    label="Timezone"
                    onChange={(e: SelectChangeEvent) => setTimezone(e.target.value)}
                  >
                    {TIMEZONES.map((tz) => (
                      <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  disabled={saving || !name.trim()}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Account details (read-only) */}
        <Card>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Account Details</Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body2">{user?.email}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Member since</Typography>
                <Typography variant="body2">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
