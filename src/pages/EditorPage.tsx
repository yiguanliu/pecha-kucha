import { useState, useEffect, useRef } from 'react';
import { Box, Snackbar, Alert, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack } from '@mui/material';
import { useParams, useLocation } from 'react-router';
import type { Presentation } from '../types/presentation';
import { usePresentation } from '../hooks/usePresentation';
import Toolbar from '../components/editor/Toolbar';
import SlidePanel from '../components/editor/SlidePanel';
import SlideCanvas from '../components/editor/SlideCanvas';
import PropertiesPanel from '../components/editor/PropertiesPanel';
import { getPresentationById } from '../services/presentationService';
import { loadFromFile } from '../services/markdownService';
import type { SlideElement, ImageElement } from '../types/slide';

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);
  const [metaDialogOpen, setMetaDialogOpen] = useState(false);

  // Allow loading a presentation passed via navigation state (from "present" flow)
  const statePresentation = (location.state as { presentation?: Presentation } | null)?.presentation;

  const editor = usePresentation(statePresentation);

  // If editing an existing ID from Supabase, load it
  useEffect(() => {
    if (id && id !== 'new' && !statePresentation) {
      getPresentationById(id)
        .then((p) => {
          editor.updatePresentation(p);
        })
        .catch(() => {
          setSnack({ msg: 'Could not load presentation from Supabase', severity: 'error' });
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveLocal = async () => {
    try {
      await editor.saveLocal();
      setSnack({ msg: 'Saved to file', severity: 'success' });
    } catch {
      setSnack({ msg: 'Failed to save file', severity: 'error' });
    }
  };

  const handlePublish = async () => {
    if (!editor.presentation.authorName) {
      setMetaDialogOpen(true);
      return;
    }
    try {
      await editor.publish();
      setSnack({ msg: 'Shared to library!', severity: 'success' });
    } catch {
      setSnack({ msg: 'Failed to share. Check Supabase credentials.', severity: 'error' });
    }
  };

  const handleLoadFile = async (file: File) => {
    try {
      const p = await loadFromFile(file);
      editor.updatePresentation(p);
      setSnack({ msg: `Loaded "${p.title}"`, severity: 'success' });
    } catch {
      setSnack({ msg: 'Failed to load file', severity: 'error' });
    }
  };

  const handleAddElement = (el: SlideElement) => {
    if (!editor.activeSlide) return;
    editor.addElement(editor.activeSlide.id, el);
    setSelectedElementId(el.id);
  };

  // Keep a stable ref so the paste listener doesn't go stale
  const handleAddElementRef = useRef(handleAddElement);
  handleAddElementRef.current = handleAddElement;
  const activeSlideRef = useRef(editor.activeSlide);
  activeSlideRef.current = editor.activeSlide;

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!activeSlideRef.current) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const src = ev.target?.result as string;
            const el: ImageElement = {
              id: crypto.randomUUID(),
              type: 'image',
              x: 10,
              y: 10,
              width: 60,
              height: 50,
              zIndex: Date.now(),
              src,
              alt: 'Pasted image',
              objectFit: 'contain',
            };
            handleAddElementRef.current(el);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const selectedElement =
    editor.activeSlide?.elements.find((el) => el.id === selectedElementId) ?? null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Toolbar */}
      <Toolbar
        presentation={editor.presentation}
        onSaveLocal={handleSaveLocal}
        onPublish={handlePublish}
        isSaving={editor.isSaving}
        isDirty={editor.isDirty}
        onAddElement={handleAddElement}
        onLoadFile={handleLoadFile}
      />

      {/* Editor body */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: slide list */}
        <SlidePanel
          slides={editor.presentation.slides}
          activeIndex={editor.activeSlideIndex}
          onSelectSlide={(i) => {
            editor.setActiveSlideIndex(i);
            setSelectedElementId(null);
          }}
          onDeleteSlide={(slideId) => {
            editor.deleteSlide(slideId);
            setSelectedElementId(null);
          }}
          onAddSlide={(afterIndex) => {
            editor.addSlide(afterIndex);
            setSelectedElementId(null);
          }}
        />

        {/* Center: canvas */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            overflow: 'hidden',
            bgcolor: 'background.default',
          }}
        >
          {editor.activeSlide && (
            <SlideCanvas
              slide={editor.activeSlide}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={(elId, updates) =>
                editor.updateElement(editor.activeSlide!.id, elId, updates)
              }
              onAddElement={handleAddElement}
            />
          )}
        </Box>

        {/* Right: properties */}
        <PropertiesPanel
          slide={editor.activeSlide ?? null}
          selectedElement={selectedElement}
          onUpdateSlide={(updates) =>
            editor.activeSlide && editor.updateSlide(editor.activeSlide.id, updates)
          }
          onUpdateElement={(updates) =>
            selectedElement &&
            editor.updateElement(editor.activeSlide!.id, selectedElement.id, updates)
          }
          onRemoveElement={() => {
            if (selectedElement) {
              editor.removeElement(editor.activeSlide!.id, selectedElement.id);
              setSelectedElementId(null);
            }
          }}
        />
      </Box>

      {/* Meta dialog — prompt for author name before publishing */}
      <Dialog open={metaDialogOpen} onClose={() => setMetaDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Before you share...</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Your name"
              fullWidth
              value={editor.presentation.authorName}
              onChange={(e) => editor.updatePresentation({ authorName: e.target.value })}
              autoFocus
            />
            <TextField
              label="Presentation title"
              fullWidth
              value={editor.presentation.title}
              onChange={(e) => editor.updatePresentation({ title: e.target.value })}
            />
            <TextField
              label="Tags (comma-separated)"
              fullWidth
              placeholder="ai, design, exhibition"
              onChange={(e) =>
                editor.updatePresentation({
                  tags: e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetaDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setMetaDialogOpen(false);
              await handlePublish();
            }}
            disabled={!editor.presentation.authorName}
          >
            Share to library
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snack notifications */}
      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.severity ?? 'info'} onClose={() => setSnack(null)}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
