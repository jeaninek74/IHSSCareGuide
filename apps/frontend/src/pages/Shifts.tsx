
import { Container, Typography, Box } from '@mui/material';

const Shifts = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Shift Companion</Typography>
      <Typography variant="body1" color="text.secondary">
        Shift workflow coming in Milestone 3.
      </Typography>
    </Box>
  </Container>
);

export default Shifts;
