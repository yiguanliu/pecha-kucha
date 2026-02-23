import { useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import type { Slide, SlideElement, TextElement, ImageElement, LinkElement } from '../../types/slide';
import TextElementComp from './elements/TextElement';
import ImageElementComp from './elements/ImageElement';
import LinkElementComp from './elements/LinkElement';

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
    elementId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const getCanvasSize = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { w: rect?.width ?? 1, h: rect?.height ?? 1 };
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    elementId: string,
    origX: number,
    origY: number
  ) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelectElement(elementId);
    dragging.current = {
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      origX,
      origY,
    };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging.current || readOnly) return;
      const { w, h } = getCanvasSize();
      const dx = ((e.clientX - dragging.current.startX) / w) * 100;
      const dy = ((e.clientY - dragging.current.startY) / h) * 100;
      onUpdateElement(dragging.current.elementId, {
        x: Math.max(0, Math.min(95, dragging.current.origX + dx)),
        y: Math.max(0, Math.min(95, dragging.current.origY + dy)),
      });
    },
    [onUpdateElement, readOnly]
  );

  const handleMouseUp = () => {
    dragging.current = null;
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '900px',
        position: 'relative',
        '&::before': {
          content: '""',
          display: 'block',
          paddingTop: '56.25%', // 16:9 aspect ratio
        },
        boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
        borderRadius: 1,
        overflow: 'hidden',
        cursor: readOnly ? 'default' : 'default',
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
          backgroundImage: slide.backgroundImage
            ? `url(${slide.backgroundImage})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {slide.elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => {
            const isSelected = el.id === selectedElementId;
            const commonStyle: React.CSSProperties = {
              position: 'absolute',
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}%`,
              height: `${el.height}%`,
              cursor: readOnly ? 'default' : 'move',
              userSelect: 'none',
            };

            const commonProps = {
              isSelected,
              onMouseDown: (e: React.MouseEvent) =>
                handleMouseDown(e, el.id, el.x, el.y),
              style: commonStyle,
            };

            if (el.type === 'text')
              return (
                <TextElementComp
                  key={el.id}
                  {...commonProps}
                  element={el as TextElement}
                />
              );
            if (el.type === 'image')
              return (
                <ImageElementComp
                  key={el.id}
                  {...commonProps}
                  element={el as ImageElement}
                />
              );
            if (el.type === 'link')
              return (
                <LinkElementComp
                  key={el.id}
                  {...commonProps}
                  element={el as LinkElement}
                />
              );
            return null;
          })}
      </Box>
    </Box>
  );
}
