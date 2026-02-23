import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import type { Presentation } from '../../types/presentation';
import type { SlideElement, TextElement, ImageElement, LinkElement } from '../../types/slide';

interface Props {
  presentation: Presentation;
  onSaveLocal: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isDirty: boolean;
  onAddElement: (el: SlideElement) => void;
  onLoadFile: (file: File) => void;
}

export default function Toolbar({
  presentation,
  onSaveLocal,
  onPublish,
  isSaving,
  isDirty,
  onAddElement,
  onLoadFile,
}: Props) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');

  const handleAddText = () => {
    const el: TextElement = {
      id: crypto.randomUUID(),
      type: 'text',
      x: 10,
      y: 10,
      width: 60,
      height: 15,
      zIndex: Date.now(),
      content: 'Double-click to edit',
      fontSize: 28,
      fontWeight: 'normal',
      color: '#ffffff',
      align: 'left',
    };
    onAddElement(el);
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    const el: ImageElement = {
      id: crypto.randomUUID(),
      type: 'image',
      x: 10,
      y: 10,
      width: 60,
      height: 50,
      zIndex: Date.now(),
      src: imageUrl.trim(),
      alt: '',
      objectFit: 'cover',
    };
    onAddElement(el);
    setImageUrl('');
    setImageDialogOpen(false);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    const el: LinkElement = {
      id: crypto.randomUUID(),
      type: 'link',
      x: 10,
      y: 80,
      width: 50,
      height: 8,
      zIndex: Date.now(),
      url: linkUrl.trim(),
      label: linkLabel.trim() || linkUrl.trim(),
      color: '#9D8FF9',
    };
    onAddElement(el);
    setLinkUrl('');
    setLinkLabel('');
    setLinkDialogOpen(false);
  };

  const handlePresent = async () => {
    // Pass presentation via navigation state to avoid requiring a Supabase save
    navigate('/present/local', { state: { presentation } });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          gap: 1,
          minHeight: 52,
        }}
      >
        <Tooltip title="Back to library">
          <IconButton size="small" onClick={() => navigate('/')} sx={{ mr: 0.5 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Add elements */}
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Add text">
            <IconButton size="small" onClick={handleAddText}>
              <TextFieldsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add image">
            <IconButton size="small" onClick={() => setImageDialogOpen(true)}>
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add link">
            <IconButton size="small" onClick={() => setLinkDialogOpen(true)}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Divider orientation="vertical" flexItem />

        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {presentation.title}
          {isDirty && (
            <Box component="span" sx={{ color: 'primary.light', ml: 0.5 }}>
              ●
            </Box>
          )}
        </Typography>

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Load from file">
            <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
              <FolderOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Present">
            <IconButton size="small" onClick={handlePresent}>
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
          <Button
            startIcon={<SaveIcon />}
            size="small"
            onClick={onSaveLocal}
            disabled={isSaving}
            variant="outlined"
          >
            Save
          </Button>
          <Button
            startIcon={<CloudUploadIcon />}
            variant="contained"
            size="small"
            onClick={onPublish}
            disabled={isSaving}
          >
            Share
          </Button>
        </Stack>
      </Box>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onLoadFile(file);
          e.target.value = '';
        }}
      />

      {/* Add Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Image</DialogTitle>
        <DialogContent>
          <TextField
            label="Image URL"
            fullWidth
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
            placeholder="https://example.com/image.jpg"
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddImage} disabled={!imageUrl.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Link</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="URL"
              fullWidth
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
            />
            <TextField
              label="Display label (optional)"
              fullWidth
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              placeholder="Leave blank to use URL"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLink} disabled={!linkUrl.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
