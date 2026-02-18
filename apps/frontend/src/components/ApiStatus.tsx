import React, { useEffect, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { apiClient } from '../services/apiClient';
import { HealthResponse } from '../shared/types';

const ApiStatus = () => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [info, setInfo] = useState<HealthResponse | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await apiClient.get<HealthResponse>('/health');
        setInfo(res.data);
        setStatus(res.data.database === 'connected' ? 'ok' : 'error');
      } catch {
        setStatus('error');
      }
    };
    check();
  }, []);

  if (status === 'checking') {
    return <Chip label="Checking API..." size="small" color="default" />;
  }

  if (status === 'ok') {
    return (
      <Tooltip title={`API: ${info?.environment} v${info?.version} | DB: ${info?.database}`}>
        <Chip
          icon={<CheckCircleIcon />}
          label="API Connected"
          size="small"
          color="success"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  return (
    <Chip
      icon={<ErrorIcon />}
      label="API Unavailable"
      size="small"
      color="error"
      variant="outlined"
    />
  );
};

export default ApiStatus;
