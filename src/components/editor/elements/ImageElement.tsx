import type { CSSProperties } from 'react';
import type { ImageElement } from '../../../types/slide';

interface Props {
  element: ImageElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  style: CSSProperties;
}

export default function ImageElementComp({ element, onMouseDown, onClick, style, isSelected }: Props) {
  return (
    <div
      style={{
        ...style,
        outline: isSelected ? '2px solid #7C6AF7' : '2px solid transparent',
        borderRadius: 4,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <img
        src={element.src}
        alt={element.alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: element.objectFit,
          display: 'block',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
    </div>
  );
}
