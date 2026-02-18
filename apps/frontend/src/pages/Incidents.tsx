import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Incidents = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Incident Protection</Typography>
      <Typography variant="body1" color="text.secondary">
        Incident logging and reporting coming in Milestone 6.
      </Typography>
    </Box>
  </Container>
);

export default Incidents;
