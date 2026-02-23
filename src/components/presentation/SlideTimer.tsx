import { Box, Typography, LinearProgress } from '@mui/material';

interface Props {
  timeLeft: number;
  duration: number;
  progress: number;
}

export default function SlideTimer({ timeLeft, duration, progress }: Props) {
  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pb: 1 }}>
        <Typography
          variant="h4"
          sx={{
            color: isUrgent ? 'secondary.main' : 'rgba(255,255,255,0.35)',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            transition: 'color 0.3s',
            fontSize: '2rem',
          }}
        >
          {timeLeft}
          <Typography
            component="span"
            sx={{ fontSize: '0.9rem', color: 'inherit', ml: 0.5, opacity: 0.6 }}
          >
            / {duration}s
          </Typography>
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 3,
          borderRadius: 0,
          bgcolor: 'rgba(255,255,255,0.08)',
          '& .MuiLinearProgress-bar': {
            bgcolor: isUrgent ? 'secondary.main' : 'primary.main',
            transition: 'background-color 0.3s, transform 0.9s linear',
          },
        }}
      />
    </Box>
  );
}
