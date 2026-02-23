import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { CircularProgress, Box } from '@mui/material';
import type { Presentation } from '../types/presentation';
import { getPresentationById } from '../services/presentationService';
import PresentationMode from '../components/presentation/PresentationMode';

export default function PresentationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if presentation was passed via navigation state (local/unsaved)
  const statePresentation = (location.state as { presentation?: Presentation } | null)?.presentation;

  const [presentation, setPresentation] = useState<Presentation | null>(
    statePresentation ?? null
  );
  const [loading, setLoading] = useState(!statePresentation);

  useEffect(() => {
    if (statePresentation) return;
    if (!id || id === 'local') {
      setLoading(false);
      return;
    }
    getPresentationById(id)
      .then(setPresentation)
      .finally(() => setLoading(false));
  }, [id, statePresentation]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!presentation) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
          color: 'text.secondary',
        }}
      >
        Presentation not found
      </Box>
    );
  }

  return (
    <PresentationMode
      presentation={presentation}
      onClose={() => navigate(-1)}
    />
  );
}
