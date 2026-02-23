import { Box, Typography, Stack, Tooltip, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Slide, TextElement, ImageElement } from '../../types/slide';

interface Props {
  slides: Slide[];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  onDeleteSlide?: (slideId: string) => void;
  onAddSlide?: (afterIndex: number) => void;
}

// Thumbnail inner width ≈ 134px, full canvas = 900px
const SCALE = 134 / 900;

export default function SlidePanel({ slides, activeIndex, onSelectSlide, onDeleteSlide, onAddSlide }: Props) {
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
          <Box key={slide.id} sx={{ position: 'relative', '&:hover .slide-delete-btn': { opacity: 1 } }}>
          <Tooltip title={slide.title} placement="right">
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
              {/* Background image */}
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

              {/* Scaled element previews */}
              <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 900,
                    height: 506.25,
                    transform: `scale(${SCALE})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {slide.elements
                    .slice()
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map((el) => {
                      const baseStyle: React.CSSProperties = {
                        position: 'absolute',
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.width}%`,
                        height: `${el.height}%`,
                        overflow: 'hidden',
                      };
                      if (el.type === 'text') {
                        const t = el as TextElement;
                        return (
                          <div key={el.id} style={{ ...baseStyle, padding: '4px 8px', boxSizing: 'border-box' }}>
                            <p style={{
                              margin: 0,
                              fontSize: t.fontSize,
                              fontWeight: t.fontWeight,
                              color: t.color,
                              textAlign: t.align,
                              lineHeight: 1.3,
                              wordBreak: 'break-word',
                              fontFamily: 'Inter, Roboto, sans-serif',
                            }}>
                              {t.content}
                            </p>
                          </div>
                        );
                      }
                      if (el.type === 'image') {
                        const img = el as ImageElement;
                        return (
                          <div key={el.id} style={baseStyle}>
                            <img
                              src={img.src}
                              alt={img.alt}
                              style={{ width: '100%', height: '100%', objectFit: img.objectFit, display: 'block' }}
                              draggable={false}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                </Box>
              </Box>

              {/* Title overlay at bottom */}
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
          {onDeleteSlide && slides.length > 1 && (
            <IconButton
              className="slide-delete-btn"
              size="small"
              onClick={(e) => { e.stopPropagation(); onDeleteSlide(slide.id); }}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                opacity: 0,
                transition: 'opacity 0.15s',
                bgcolor: 'rgba(0,0,0,0.55)',
                p: '2px',
                '&:hover': { bgcolor: 'error.main' },
              }}
            >
              <DeleteIcon sx={{ fontSize: 13, color: '#fff' }} />
            </IconButton>
          )}
          </Box>
        ))}
      </Stack>

      {onAddSlide && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onAddSlide(activeIndex)}
          sx={{ mt: 1.5, width: '100%', fontSize: 11, justifyContent: 'flex-start', pl: 0.5 }}
        >
          Add slide
        </Button>
      )}
    </Box>
  );
}
