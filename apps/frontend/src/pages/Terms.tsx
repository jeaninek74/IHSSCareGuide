import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: February 2026
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ '& h6': { mt: 4, mb: 1, fontWeight: 700 }, '& p': { mb: 2, lineHeight: 1.8 } }}>
          <Typography variant="h6">1. Acceptance of Terms</Typography>
          <Typography>
            By accessing or using the IHSS Caregiver Companion application ("the App"), you agree to be bound
            by these Terms of Service. If you do not agree, please do not use the App.
          </Typography>

          <Typography variant="h6">2. Description of Service</Typography>
          <Typography>
            IHSS Caregiver Companion is a workflow support tool designed to help In-Home Supportive Services
            (IHSS) caregivers organize shift documentation, generate structured care notes, and access
            general guidance about IHSS and ESP workflows. The App is a companion tool only and does not
            replace any official IHSS or Electronic Services Portal (ESP) system.
          </Typography>

          <Typography variant="h6">3. Not an Official IHSS Service</Typography>
          <Typography>
            This application is not affiliated with, endorsed by, or operated by the California Department
            of Social Services (CDSS), any county IHSS program, or the Electronic Services Portal (ESP).
            Information provided through the App is for general organizational guidance only and should not
            be relied upon as official compliance advice.
          </Typography>

          <Typography variant="h6">4. No Legal or Medical Advice</Typography>
          <Typography>
            Nothing in this App constitutes legal advice, medical advice, or a guarantee of compliance with
            IHSS regulations. Always verify important information with your county IHSS office or a qualified
            professional.
          </Typography>

          <Typography variant="h6">5. User Responsibilities</Typography>
          <Typography>
            You are responsible for the accuracy of information you enter into the App. You must not use the
            App to store sensitive personal health information beyond what is necessary for shift documentation.
            You are responsible for maintaining the security of your account credentials.
          </Typography>

          <Typography variant="h6">6. Data and Privacy</Typography>
          <Typography>
            Your use of the App is also governed by our{' '}
            <Link to="/privacy" style={{ color: 'inherit' }}>Privacy Policy</Link>. We store your shift
            records and account information securely. We do not sell your data to third parties.
          </Typography>

          <Typography variant="h6">7. AI-Generated Content</Typography>
          <Typography>
            The App uses artificial intelligence to generate structured notes and summaries. AI-generated
            content is provided for organizational convenience only. You must review all AI-generated content
            before relying on it. The App does not guarantee the accuracy or completeness of AI outputs.
          </Typography>

          <Typography variant="h6">8. Limitation of Liability</Typography>
          <Typography>
            To the fullest extent permitted by law, IHSS Caregiver Companion and its operators shall not be
            liable for any indirect, incidental, special, or consequential damages arising from your use of
            the App, including any errors in AI-generated content or missed compliance deadlines.
          </Typography>

          <Typography variant="h6">9. Changes to Terms</Typography>
          <Typography>
            We may update these Terms from time to time. Continued use of the App after changes constitutes
            acceptance of the revised Terms.
          </Typography>

          <Typography variant="h6">10. Contact</Typography>
          <Typography>
            For questions about these Terms, please contact us through the App's support channel.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Link to="/privacy" style={{ color: 'inherit' }}>Privacy Policy</Link>
          <Link to="/disclaimer" style={{ color: 'inherit' }}>Disclaimer</Link>
          <Link to="/" style={{ color: 'inherit' }}>Home</Link>
        </Box>
      </Paper>
    </Container>
  );
}
