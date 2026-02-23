import type { CSSProperties } from 'react';
import type { TextElement } from '../../../types/slide';

interface Props {
  element: TextElement;
  isSelected: boolean;
  isEditing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onContentChange: (content: string) => void;
  onStopEditing: () => void;
  style: CSSProperties;
}

export default function TextElementComp({
  element,
  onMouseDown,
  onDoubleClick,
  onContentChange,
  onStopEditing,
  style,
  isSelected,
  isEditing,
}: Props) {
  return (
    <div
      style={{
        ...style,
        outline: isSelected ? '2px solid #7C6AF7' : '2px solid transparent',
        borderRadius: 4,
        padding: '4px 8px',
        boxSizing: 'border-box',
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={element.content}
          onChange={(e) => onContentChange(e.target.value)}
          onBlur={onStopEditing}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onStopEditing();
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            height: '100%',
            fontSize: element.fontSize,
            fontWeight: element.fontWeight,
            color: element.color,
            textAlign: element.align,
            lineHeight: 1.3,
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: 0,
            fontFamily: 'Inter, Roboto, sans-serif',
            boxSizing: 'border-box',
            wordBreak: 'break-word',
          }}
        />
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: element.fontSize,
            fontWeight: element.fontWeight,
            color: element.color,
            textAlign: element.align,
            lineHeight: 1.3,
            wordBreak: 'break-word',
            fontFamily: 'Inter, Roboto, sans-serif',
            pointerEvents: 'none',
          }}
        >
          {element.content}
        </p>
      )}
    </div>
  );
}
