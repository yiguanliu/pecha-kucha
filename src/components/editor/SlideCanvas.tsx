import { useRef, useCallback, useState } from 'react';
import { Box } from '@mui/material';
import type { Slide, SlideElement, TextElement, ImageElement, LinkElement } from '../../types/slide';
import TextElementComp from './elements/TextElement';
import ImageElementComp from './elements/ImageElement';
import LinkElementComp from './elements/LinkElement';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: 'nw-resize', n: 'n-resize',  ne: 'ne-resize',
  e:  'e-resize',  se: 'se-resize', s:  's-resize',
  sw: 'sw-resize', w: 'w-resize',
};

const HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function handlePos(h: ResizeHandle): React.CSSProperties {
  const O = -5; // offset = half handle size (10px / 2)
  const MID = 'calc(50% - 5px)';
  switch (h) {
    case 'nw': return { left: O,   top: O };
    case 'n':  return { left: MID, top: O };
    case 'ne': return { right: O,  top: O };
    case 'e':  return { right: O,  top: MID };
    case 'se': return { right: O,  bottom: O };
    case 's':  return { left: MID, bottom: O };
    case 'sw': return { left: O,   bottom: O };
    case 'w':  return { left: O,   top: MID };
  }
}

interface Props {
  slide: Slide;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
  onAddElement?: (el: SlideElement) => void;
  readOnly?: boolean;
}

export default function SlideCanvas({
  slide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  readOnly = false,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const dragging = useRef<{
    elementId: string; startX: number; startY: number; origX: number; origY: number;
  } | null>(null);

  const resizing = useRef<{
    elementId: string; handle: ResizeHandle;
    startX: number; startY: number;
    origX: number; origY: number; origW: number; origH: number;
  } | null>(null);

  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [canvasCursor, setCanvasCursor] = useState('default');
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

  const getCanvasSize = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { w: rect?.width ?? 1, h: rect?.height ?? 1 };
  };

  // ── Hover with debounce so moving onto a handle doesn't flicker ─────────────
  const onElementEnter = (id: string) => {
    if (readOnly) return;
    clearTimeout(hoverTimer.current);
    setHoveredElementId(id);
  };

  const onElementLeave = () => {
    hoverTimer.current = setTimeout(() => setHoveredElementId(null), 80);
  };

  const onHandleEnter = (id: string) => {
    clearTimeout(hoverTimer.current);
    setHoveredElementId(id);
  };

  // ── Drag (move) ──────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent, elementId: string, origX: number, origY: number) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelectElement(elementId);
    dragging.current = { elementId, startX: e.clientX, startY: e.clientY, origX, origY };
  };

  // ── Resize ───────────────────────────────────────────────────────────────────
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    elementId: string,
    handle: ResizeHandle,
    el: SlideElement
  ) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    onSelectElement(elementId);
    setCanvasCursor(HANDLE_CURSORS[handle]);
    resizing.current = {
      elementId, handle,
      startX: e.clientX, startY: e.clientY,
      origX: el.x, origY: el.y, origW: el.width, origH: el.height,
    };
  };

  // ── Mouse move: handles both drag and resize ─────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      const { w, h } = getCanvasSize();

      if (resizing.current) {
        const { handle, elementId, startX, startY, origX, origY, origW, origH } = resizing.current;
        const dx = ((e.clientX - startX) / w) * 100;
        const dy = ((e.clientY - startY) / h) * 100;
        const MIN = 4;
        let nx = origX, ny = origY, nw = origW, nh = origH;

        // Horizontal
        if (handle.includes('e')) nw = Math.max(MIN, origW + dx);
        if (handle.includes('w')) {
          const clamp = Math.min(dx, origW - MIN);
          nx = origX + clamp;
          nw = origW - clamp;
        }
        // Vertical
        if (handle.includes('s')) nh = Math.max(MIN, origH + dy);
        if (handle.includes('n')) {
          const clamp = Math.min(dy, origH - MIN);
          ny = origY + clamp;
          nh = origH - clamp;
        }

        onUpdateElement(elementId, {
          x: Math.max(0, nx),
          y: Math.max(0, ny),
          width: Math.min(100, nw),
          height: Math.min(100, nh),
        });
        return;
      }

      if (dragging.current) {
        const dx = ((e.clientX - dragging.current.startX) / w) * 100;
        const dy = ((e.clientY - dragging.current.startY) / h) * 100;
        onUpdateElement(dragging.current.elementId, {
          x: Math.max(0, Math.min(95, dragging.current.origX + dx)),
          y: Math.max(0, Math.min(95, dragging.current.origY + dy)),
        });
      }
    },
    [onUpdateElement, readOnly]
  );

  const handleMouseUp = () => {
    dragging.current = null;
    resizing.current = null;
    setCanvasCursor('default');
  };

  // ── Double-click to edit text ─────────────────────────────────────────────────
  const handleDoubleClick = (e: React.MouseEvent, elementId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    setEditingElementId(elementId);
  };

  const handleStopEditing = () => setEditingElementId(null);

  // ── Resize handle overlay ─────────────────────────────────────────────────────
  const renderHandles = (el: SlideElement, selected: boolean) => (
    <div
      style={{
        position: 'absolute',
        inset: -2, // sit just outside the element border
        pointerEvents: 'none',
        zIndex: 9998,
        // Dashed border hint when hovered but not selected
        border: selected ? 'none' : '1px dashed rgba(124,106,247,0.55)',
        borderRadius: 4,
        boxSizing: 'border-box',
      }}
    >
      {HANDLES.map((h) => (
        <div
          key={h}
          onMouseDown={(e) => handleResizeMouseDown(e, el.id, h, el)}
          onMouseEnter={() => onHandleEnter(el.id)}
          onMouseLeave={onElementLeave}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            ...handlePos(h),
            backgroundColor: selected ? '#fff' : 'rgba(255,255,255,0.7)',
            border: '2px solid #7C6AF7',
            borderRadius: '50%',
            cursor: HANDLE_CURSORS[h],
            pointerEvents: 'all',
            zIndex: 9999,
            boxSizing: 'border-box',
            boxShadow: selected ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
            opacity: selected ? 1 : 0.75,
          }}
        />
      ))}
    </div>
  );

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '900px',
        position: 'relative',
        '&::before': { content: '""', display: 'block', paddingTop: '56.25%' },
        boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
        borderRadius: 1,
        overflow: 'hidden',
        cursor: canvasCursor,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => !readOnly && onSelectElement(null)}
    >
      <Box
        ref={canvasRef}
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: slide.backgroundColor,
          backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {slide.elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => {
            const isSelected = el.id === selectedElementId;
            const isHovered = el.id === hoveredElementId;
            const showHandles = !readOnly && (isSelected || isHovered);

            // Elements fill their wrapper; wrapper provides absolute positioning
            const innerStyle: React.CSSProperties = {
              width: '100%',
              height: '100%',
              cursor: readOnly ? 'default' : 'move',
              userSelect: 'none',
            };

            const commonProps = {
              isSelected,
              onMouseDown: (e: React.MouseEvent) => handleMouseDown(e, el.id, el.x, el.y),
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
              style: innerStyle,
            };

            let node: React.ReactNode = null;
            if (el.type === 'text')
              node = (
                <TextElementComp
                  {...commonProps}
                  element={el as TextElement}
                  isEditing={el.id === editingElementId}
                  onDoubleClick={(e) => handleDoubleClick(e, el.id)}
                  onContentChange={(content) => onUpdateElement(el.id, { content })}
                  onStopEditing={handleStopEditing}
                />
              );
            else if (el.type === 'image')
              node = <ImageElementComp {...commonProps} element={el as ImageElement} />;
            else if (el.type === 'link')
              node = <LinkElementComp {...commonProps} element={el as LinkElement} />;

            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  height: `${el.height}%`,
                  zIndex: el.zIndex,
                }}
                onMouseEnter={() => onElementEnter(el.id)}
                onMouseLeave={onElementLeave}
              >
                {node}
                {showHandles && renderHandles(el, isSelected)}
              </div>
            );
          })}
      </Box>
    </Box>
  );
}
