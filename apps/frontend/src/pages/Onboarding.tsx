import { useState } from 'react';
import {
  Container, Typography, Box, Paper, Button, Stepper, Step, StepLabel,
  TextField, Alert, Divider, Chip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const steps = ['Welcome', 'About This App', 'Important Disclaimer', 'Your Profile', 'Get Started'];

export default function Onboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [county, setCounty] = useState('');
  const [providerNumber, setProviderNumber] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Mark onboarding complete in localStorage
      localStorage.setItem('onboarding_complete', 'true');
      navigate('/dashboard');
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const canProceed = () => {
    if (activeStep === 2) return acknowledged;
    return true;
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: Welcome */}
        {activeStep === 0 && (
          <Box textAlign="center">
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Welcome to IHSS Care Guide
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Hello{user?.email ? `, ${user.email.split('@')[0]}` : ''}! This quick setup will help you understand
              what this app does and get you ready to log your first shift.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
              {['Shift Logging', 'AI Notes', 'Weekly Exports', 'Knowledge Assistant', 'Certification Tracker'].map((f) => (
                <Chip key={f} label={f} color="primary" variant="outlined" size="small" />
              ))}
            </Box>
          </Box>
        )}

        {/* Step 1: About This App */}
        {activeStep === 1 && (
          <Box>
            <AssignmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              What This App Does
            </Typography>
            <Box sx={{ '& p': { mb: 2, lineHeight: 1.8 } }}>
              <Typography>
                <strong>Shift Logging:</strong> Record when your shifts start and end, and log care
                activities as events during the shift.
              </Typography>
              <Typography>
                <strong>AI-Structured Notes:</strong> After a shift, generate a structured care note
                from your logged events using AI — ready to reference for documentation.
              </Typography>
              <Typography>
                <strong>Weekly Exports:</strong> Generate a weekly summary of your shifts, formatted
                to help you prepare your ESP timesheet submission.
              </Typography>
              <Typography>
                <strong>Knowledge Assistant:</strong> Ask questions about IHSS rules, ESP workflows,
                and caregiver rights — grounded in official guidance documents.
              </Typography>
              <Typography>
                <strong>Certification Tracker:</strong> Track your required trainings and certifications
                with automatic expiry reminders.
              </Typography>
            </Box>
            <Alert severity="info" sx={{ mt: 2 }}>
              <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              This app uses AI to help organize your documentation. Always review AI outputs before use.
            </Alert>
          </Box>
        )}

        {/* Step 2: Disclaimer */}
        {activeStep === 2 && (
          <Box>
            <WarningAmberIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Important Disclaimer
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography fontWeight={600} gutterBottom>
                Please read and acknowledge before continuing.
              </Typography>
            </Alert>
            <Box sx={{ '& p': { mb: 2, lineHeight: 1.8 } }}>
              <Typography>
                This app is <strong>not affiliated with</strong> the California Department of Social
                Services (CDSS), any county IHSS program, or the Electronic Services Portal (ESP).
              </Typography>
              <Typography>
                This app <strong>does not submit timesheets</strong> to ESP on your behalf. You must
                continue to submit your timesheets directly through the official ESP system.
              </Typography>
              <Typography>
                AI-generated notes and summaries are for <strong>organizational convenience only</strong>.
                They may contain errors. Always verify important information with your county IHSS office.
              </Typography>
              <Typography>
                Nothing in this app constitutes <strong>legal or medical advice</strong>.
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 1, borderRadius: 1,
                border: acknowledged ? '2px solid' : '1px solid', borderColor: acknowledged ? 'primary.main' : 'divider',
                '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => setAcknowledged(!acknowledged)}
            >
              <CheckCircleOutlineIcon color={acknowledged ? 'primary' : 'disabled'} />
              <Typography variant="body2">
                I understand this is a workflow support tool and not an official IHSS service. I will
                verify important information with official sources.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Step 3: Profile */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Your Profile (Optional)
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              These details help personalize your experience. You can skip this step.
            </Typography>
            <TextField
              label="County"
              placeholder="e.g., Los Angeles, San Diego"
              fullWidth
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              sx={{ mb: 2 }}
              helperText="The county where you provide IHSS care"
            />
            <TextField
              label="Provider Number (optional)"
              placeholder="e.g., 1234567890"
              fullWidth
              value={providerNumber}
              onChange={(e) => setProviderNumber(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Your IHSS provider number for reference only — not shared with any official system"
            />
          </Box>
        )}

        {/* Step 4: Get Started */}
        {activeStep === 4 && (
          <Box textAlign="center">
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              You're All Set!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your account is ready. Here's what to do first:
            </Typography>
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography sx={{ mb: 1 }}>
                1. <strong>Start a shift</strong> — go to Shifts and click "Start New Shift"
              </Typography>
              <Typography sx={{ mb: 1 }}>
                2. <strong>Log care events</strong> — add activities as you provide care
              </Typography>
              <Typography sx={{ mb: 1 }}>
                3. <strong>End your shift</strong> — generate AI notes when done
              </Typography>
              <Typography sx={{ mb: 1 }}>
                4. <strong>Ask the assistant</strong> — get answers to IHSS questions anytime
              </Typography>
            </Box>
            <Alert severity="success">
              Welcome to IHSS Care Guide. Let's get started!
            </Alert>
          </Box>
        )}

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined">
            Back
          </Button>
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!canProceed()}
          >
            {activeStep === steps.length - 1 ? 'Go to Dashboard' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
