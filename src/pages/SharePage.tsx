import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { Presentation } from '../types/presentation';
import { getPresentationById } from '../services/presentationService';
import SlideCanvas from '../components/editor/SlideCanvas';

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    getPresentationById(id)
      .then(setPresentation)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!presentation) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="text.secondary">Presentation not found</Typography>
      </Container>
    );
  }

  const slide = presentation.slides[activeIndex];

  const initials = presentation.authorName
    ? presentation.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back + actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          color="inherit"
          size="small"
        >
          Library
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={() => navigate(`/present/${id}`)}
          size="small"
        >
          Present
        </Button>
      </Box>

      {/* Presentation header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {presentation.title}
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.dark' }}>
              {initials}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {presentation.authorName || 'Anonymous'}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.disabled">
            {new Date(presentation.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Typography>
          {presentation.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Slide viewer */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Slide list */}
        <Box sx={{ width: 120, flexShrink: 0 }}>
          <Stack spacing={1}>
            {presentation.slides.map((s, i) => (
              <Box
                key={s.id}
                onClick={() => setActiveIndex(i)}
                sx={{
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: i === activeIndex ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative',
                  paddingTop: '56.25%',
                  bgcolor: s.backgroundColor,
                  transition: 'border-color 0.15s',
                  '&:hover': { borderColor: 'primary.light' },
                }}
              >
                <Box sx={{ position: 'absolute', bottom: 2, left: 4 }}>
                  <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
                    {i + 1}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Main canvas */}
        <Box sx={{ flex: 1 }}>
          {slide && (
            <SlideCanvas
              slide={slide}
              selectedElementId={null}
              onSelectElement={() => {}}
              onUpdateElement={() => {}}
              readOnly
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Typography variant="caption" color="text.disabled">
              {activeIndex + 1} / {presentation.slides.length} — {slide?.title}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
