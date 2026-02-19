import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Last updated: February 2026
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ '& h6': { mt: 4, mb: 1, fontWeight: 700 }, '& p': { mb: 2, lineHeight: 1.8 } }}>
          <Typography variant="h6">1. Information We Collect</Typography>
          <Typography>
            We collect information you provide when creating an account (name, email address, password hash),
            shift records and event logs you enter, structured notes and weekly exports generated from your
            data, incident reports you submit, and questions you ask the knowledge assistant.
          </Typography>

          <Typography variant="h6">2. How We Use Your Information</Typography>
          <Typography>
            We use your information to provide the App's core functionality: storing and displaying your
            shift history, generating AI-structured notes from your entries, and answering questions through
            the knowledge assistant. We do not use your data for advertising or sell it to third parties.
          </Typography>

          <Typography variant="h6">3. AI Processing</Typography>
          <Typography>
            When you use AI features (note generation, weekly summaries, knowledge assistant), your input
            is sent to OpenAI's API for processing. OpenAI's data handling is governed by their privacy
            policy. We do not send personally identifiable information beyond what is necessary to generate
            the requested output. All inputs are moderated before processing.
          </Typography>

          <Typography variant="h6">4. Data Storage</Typography>
          <Typography>
            Your data is stored in a secure PostgreSQL database hosted on Railway's infrastructure. Data is
            encrypted in transit using TLS. We retain your data for as long as your account is active. You
            may request deletion of your account and associated data at any time.
          </Typography>

          <Typography variant="h6">5. Cookies and Sessions</Typography>
          <Typography>
            We use a single httpOnly session cookie to maintain your login state. This cookie is not
            accessible to JavaScript and is cleared when you log out. We do not use tracking cookies or
            third-party analytics cookies.
          </Typography>

          <Typography variant="h6">6. Data Sharing</Typography>
          <Typography>
            We do not sell, rent, or share your personal data with third parties except as required to
            operate the service (hosting infrastructure, OpenAI API for AI features) or as required by law.
          </Typography>

          <Typography variant="h6">7. Your Rights</Typography>
          <Typography>
            You have the right to access, correct, or delete your personal data. To exercise these rights,
            contact us through the App's support channel. We will respond within 30 days.
          </Typography>

          <Typography variant="h6">8. Security</Typography>
          <Typography>
            We implement industry-standard security measures including TLS encryption, httpOnly cookies,
            password hashing (bcrypt), and rate limiting. No system is completely secure; please use a
            strong, unique password for your account.
          </Typography>

          <Typography variant="h6">9. Children's Privacy</Typography>
          <Typography>
            This App is intended for adult IHSS caregivers. We do not knowingly collect data from children
            under 13. If you believe a child has provided us with personal information, please contact us.
          </Typography>

          <Typography variant="h6">10. Changes to This Policy</Typography>
          <Typography>
            We may update this Privacy Policy. We will notify you of significant changes by posting a notice
            in the App. Continued use after changes constitutes acceptance.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Link to="/terms" style={{ color: 'inherit' }}>Terms of Service</Link>
          <Link to="/disclaimer" style={{ color: 'inherit' }}>Disclaimer</Link>
          <Link to="/" style={{ color: 'inherit' }}>Home</Link>
        </Box>
      </Paper>
    </Container>
  );
}
