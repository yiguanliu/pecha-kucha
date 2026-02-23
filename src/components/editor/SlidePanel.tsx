import { Box, Typography, Stack, Tooltip } from '@mui/material';
import type { Slide } from '../../types/slide';

interface Props {
  slides: Slide[];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
}

export default function SlidePanel({ slides, activeIndex, onSelectSlide }: Props) {
  return (
    <Box
      sx={{
        width: 160,
        flexShrink: 0,
        overflowY: 'auto',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 1.5,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 2 },
      }}
    >
      <Typography variant="overline" color="text.secondary" sx={{ px: 0.5, display: 'block', mb: 1, fontSize: 10 }}>
        Slides
      </Typography>
      <Stack spacing={1.5}>
        {slides.map((slide, i) => (
          <Tooltip key={slide.id} title={slide.title} placement="right">
            <Box
              onClick={() => onSelectSlide(i)}
              sx={{
                cursor: 'pointer',
                border: '2px solid',
                borderColor: i === activeIndex ? 'primary.main' : 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
                paddingTop: '56.25%',
                bgcolor: slide.backgroundColor,
                transition: 'border-color 0.15s, box-shadow 0.15s',
                '&:hover': {
                  borderColor: i === activeIndex ? 'primary.main' : 'primary.light',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                },
              }}
            >
              {/* Mini element previews */}
              {slide.backgroundImage && (
                <Box
                  component="img"
                  src={slide.backgroundImage}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.7,
                  }}
                />
              )}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  p: 0.5,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: 9,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {i + 1}. {slide.title}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
}
