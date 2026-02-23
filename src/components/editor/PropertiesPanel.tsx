import {
  Box,
  Typography,
  TextField,
  Divider,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import type { Slide, SlideElement, TextElement, ImageElement, LinkElement } from '../../types/slide';

interface Props {
  slide: Slide | null;
  selectedElement: SlideElement | null;
  onUpdateSlide: (updates: Partial<Slide>) => void;
  onUpdateElement: (updates: Partial<SlideElement>) => void;
  onRemoveElement: () => void;
}

export default function PropertiesPanel({
  slide,
  selectedElement,
  onUpdateSlide,
  onUpdateElement,
  onRemoveElement,
}: Props) {
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        overflowY: 'auto',
        borderLeft: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 2,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 2 },
      }}
    >
      {!selectedElement && slide && (
        <Stack spacing={2}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10 }}>
            Slide Properties
          </Typography>

          <TextField
            label="Slide title"
            size="small"
            fullWidth
            value={slide.title}
            onChange={(e) => onUpdateSlide({ title: e.target.value })}
          />

          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Background Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={slide.backgroundColor}
                style={{
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: 4,
                  padding: 0,
                  background: 'none',
                }}
                onChange={(e) => onUpdateSlide({ backgroundColor: e.target.value })}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {slide.backgroundColor}
              </Typography>
            </Box>
          </Box>

          <TextField
            label="Background image URL"
            size="small"
            fullWidth
            value={slide.backgroundImage ?? ''}
            onChange={(e) =>
              onUpdateSlide({ backgroundImage: e.target.value || undefined })
            }
            placeholder="https://..."
          />

          <TextField
            label="Presenter notes"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={slide.notes}
            onChange={(e) => onUpdateSlide({ notes: e.target.value })}
            placeholder="Jot down talking points..."
          />
        </Stack>
      )}

      {selectedElement && (
        <Stack spacing={2}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10 }}>
            {selectedElement.type === 'text' ? 'Text' : selectedElement.type === 'image' ? 'Image' : 'Link'} Element
          </Typography>

          {/* Position & Size */}
          <Stack direction="row" spacing={1}>
            <TextField
              label="X %"
              size="small"
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => onUpdateElement({ x: Number(e.target.value) })}
              inputProps={{ min: 0, max: 100 }}
            />
            <TextField
              label="Y %"
              size="small"
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => onUpdateElement({ y: Number(e.target.value) })}
              inputProps={{ min: 0, max: 100 }}
            />
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              label="W %"
              size="small"
              type="number"
              value={Math.round(selectedElement.width)}
              onChange={(e) => onUpdateElement({ width: Number(e.target.value) })}
              inputProps={{ min: 1, max: 100 }}
            />
            <TextField
              label="H %"
              size="small"
              type="number"
              value={Math.round(selectedElement.height)}
              onChange={(e) => onUpdateElement({ height: Number(e.target.value) })}
              inputProps={{ min: 1, max: 100 }}
            />
          </Stack>

          <Divider />

          {/* Text-specific controls */}
          {selectedElement.type === 'text' && (
            <>
              <TextField
                label="Content"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={(selectedElement as TextElement).content}
                onChange={(e) => onUpdateElement({ content: e.target.value })}
              />
              <TextField
                label="Font size (px)"
                size="small"
                type="number"
                fullWidth
                value={(selectedElement as TextElement).fontSize}
                onChange={(e) => onUpdateElement({ fontSize: Number(e.target.value) })}
                inputProps={{ min: 8, max: 200 }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Weight</InputLabel>
                <Select
                  label="Weight"
                  value={(selectedElement as TextElement).fontWeight}
                  onChange={(e) => onUpdateElement({ fontWeight: e.target.value as 'normal' | 'bold' })}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="bold">Bold</MenuItem>
                </Select>
              </FormControl>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Alignment
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={(selectedElement as TextElement).align}
                  onChange={(_, v) => v && onUpdateElement({ align: v })}
                >
                  <Tooltip title="Left">
                    <ToggleButton value="left"><FormatAlignLeftIcon fontSize="small" /></ToggleButton>
                  </Tooltip>
                  <Tooltip title="Center">
                    <ToggleButton value="center"><FormatAlignCenterIcon fontSize="small" /></ToggleButton>
                  </Tooltip>
                  <Tooltip title="Right">
                    <ToggleButton value="right"><FormatAlignRightIcon fontSize="small" /></ToggleButton>
                  </Tooltip>
                </ToggleButtonGroup>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Color
                </Typography>
                <input
                  type="color"
                  value={(selectedElement as TextElement).color}
                  style={{ width: 36, height: 36, cursor: 'pointer', border: 'none', borderRadius: 4, padding: 0 }}
                  onChange={(e) => onUpdateElement({ color: e.target.value })}
                />
              </Box>
            </>
          )}

          {/* Image-specific controls */}
          {selectedElement.type === 'image' && (
            <>
              <TextField
                label="Image URL"
                size="small"
                fullWidth
                value={(selectedElement as ImageElement).src}
                onChange={(e) => onUpdateElement({ src: e.target.value })}
                placeholder="https://..."
              />
              <TextField
                label="Alt text"
                size="small"
                fullWidth
                value={(selectedElement as ImageElement).alt}
                onChange={(e) => onUpdateElement({ alt: e.target.value })}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Fit</InputLabel>
                <Select
                  label="Fit"
                  value={(selectedElement as ImageElement).objectFit}
                  onChange={(e) => onUpdateElement({ objectFit: e.target.value as ImageElement['objectFit'] })}
                >
                  <MenuItem value="cover">Cover</MenuItem>
                  <MenuItem value="contain">Contain</MenuItem>
                  <MenuItem value="fill">Fill</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {/* Link-specific controls */}
          {selectedElement.type === 'link' && (
            <>
              <TextField
                label="URL"
                size="small"
                fullWidth
                value={(selectedElement as LinkElement).url}
                onChange={(e) => onUpdateElement({ url: e.target.value })}
                placeholder="https://..."
              />
              <TextField
                label="Label"
                size="small"
                fullWidth
                value={(selectedElement as LinkElement).label}
                onChange={(e) => onUpdateElement({ label: e.target.value })}
                placeholder="Display text"
              />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Color
                </Typography>
                <input
                  type="color"
                  value={(selectedElement as LinkElement).color}
                  style={{ width: 36, height: 36, cursor: 'pointer', border: 'none', borderRadius: 4, padding: 0 }}
                  onChange={(e) => onUpdateElement({ color: e.target.value })}
                />
              </Box>
            </>
          )}

          <Divider />
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            size="small"
            onClick={onRemoveElement}
            variant="outlined"
          >
            Remove element
          </Button>
        </Stack>
      )}
    </Box>
  );
}
