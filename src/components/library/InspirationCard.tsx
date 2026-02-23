import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Presentation } from '../../types/presentation';
import { useNavigate } from 'react-router';

interface Props {
  presentation: Presentation;
}

export default function InspirationCard({ presentation }: Props) {
  const navigate = useNavigate();
  const firstSlideBg = presentation.slides[0]?.backgroundColor ?? '#1a1a2e';
  const firstSlideImg = presentation.slides[0]?.backgroundImage;

  const initials = presentation.authorName
    ? presentation.authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
        },
      }}
    >
      <CardActionArea onClick={() => navigate(`/share/${presentation.id}`)}>
        {/* Visual header */}
        <Box
          sx={{
            height: 140,
            bgcolor: firstSlideBg,
            backgroundImage: firstSlideImg ? `url(${firstSlideImg})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {!firstSlideImg && (
            <SlideshowIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.12)' }} />
          )}
          {/* Slide count badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 10,
              bgcolor: 'rgba(0,0,0,0.5)',
              borderRadius: 1,
              px: 1,
              py: 0.25,
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
              {presentation.slides.length} slides · {presentation.format.duration}s each
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ pb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 1,
            }}
          >
            {presentation.title}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Avatar
              sx={{ width: 22, height: 22, fontSize: 11, bgcolor: 'primary.dark' }}
            >
              {initials}
            </Avatar>
            <Typography variant="body2" color="text.secondary" noWrap>
              {presentation.authorName || 'Anonymous'}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              {formatDate(presentation.createdAt)}
            </Typography>
          </Stack>

          {presentation.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {presentation.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 10, height: 20 }}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
