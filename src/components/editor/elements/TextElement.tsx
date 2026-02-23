import type { CSSProperties } from 'react';
import type { TextElement } from '../../../types/slide';

interface Props {
  element: TextElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  style: CSSProperties;
}

export default function TextElementComp({ element, onMouseDown, style, isSelected }: Props) {
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
    >
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
    </div>
  );
}
