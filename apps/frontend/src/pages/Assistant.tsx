import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Assistant = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Knowledge Assistant</Typography>
      <Typography variant="body1" color="text.secondary">
        IHSS and ESP knowledge assistant with RAG coming in Milestone 7.
      </Typography>
    </Box>
  </Container>
);

export default Assistant;
