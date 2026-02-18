import { useEffect, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface HealthResponse {
  status: string;
  database: string;
  environment: string;
  version: string;
}

const ApiStatus = () => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [info, setInfo] = useState<HealthResponse | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${BASE_URL}/health`, { credentials: 'include' });
        const data: HealthResponse = await res.json();
        setInfo(data);
        setStatus(data.database === 'connected' ? 'ok' : 'error');
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
