import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Presentation } from '../../types/presentation';
import { useTimer } from '../../hooks/useTimer';
import SlideTimer from './SlideTimer';
import SlideCanvas from '../editor/SlideCanvas';

interface Props {
  presentation: Presentation;
  onClose: () => void;
}

export default function PresentationMode({ presentation, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const isLastSlide = currentIndex === presentation.slides.length - 1;

  const { timeLeft, progress, start, reset } = useTimer(
    presentation.format.duration,
    () => setShowPrompt(true)
  );

  // Reset and auto-start timer whenever slide changes
  useEffect(() => {
    reset();
    const t = setTimeout(() => start(), 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleAdvance = () => {
    setShowPrompt(false);
    if (isLastSlide) {
      setIsComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleStayOnSlide = () => {
    setShowPrompt(false);
    start();
  };

  const slide = presentation.slides[currentIndex];

  if (isComplete) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: '#0F0F1A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h2" fontWeight={700}>
          That&apos;s a wrap!
        </Typography>
        <Typography variant="h5" color="text.secondary">
          {presentation.title}
        </Typography>
        {presentation.authorName && (
          <Typography variant="body1" color="text.secondary">
            by {presentation.authorName}
          </Typography>
        )}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Back to editor
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: slide.backgroundColor,
        backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-color 0.3s',
      }}
    >
      {/* Slide content */}
      <Box
        sx={{
          position: 'absolute',
          inset: '0 0 52px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <SlideCanvas
          slide={slide}
          selectedElementId={null}
          onSelectElement={() => {}}
          onUpdateElement={() => {}}
          readOnly
        />
      </Box>

      {/* Slide title (bottom left) */}
      <Box sx={{ position: 'absolute', bottom: 52, left: 24, pb: 1 }}>
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}
        >
          {slide.title}
        </Typography>
      </Box>

      {/* Slide counter (top right) */}
      <Typography
        sx={{
          position: 'absolute',
          top: 16,
          right: 24,
          color: 'rgba(255,255,255,0.25)',
          fontSize: 13,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {currentIndex + 1} / {presentation.slides.length}
      </Typography>

      {/* Exit button + title (top left) */}
      <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Exit presentation">
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.4)',
              '&:hover': { color: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(255,255,255,0.12)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
          {presentation.title}
        </Typography>
      </Box>

      {/* Timer bar at bottom */}
      <SlideTimer
        timeLeft={timeLeft}
        duration={presentation.format.duration}
        progress={progress}
      />

      {/* Time's up dialog */}
      <Dialog
        open={showPrompt}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: 'background.paper' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Time&apos;s up!</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {isLastSlide
              ? "You've finished your last slide. Ready to wrap up?"
              : `Ready to move on to slide ${currentIndex + 2}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStayOnSlide} color="inherit">
            Stay a bit longer
          </Button>
          <Button variant="contained" onClick={handleAdvance} autoFocus>
            {isLastSlide ? 'Finish' : 'Next slide →'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
