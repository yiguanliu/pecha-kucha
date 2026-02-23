import type { CSSProperties } from 'react';
import type { LinkElement } from '../../../types/slide';
import LinkIcon from '@mui/icons-material/Link';

interface Props {
  element: LinkElement;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  style: CSSProperties;
}

export default function LinkElementComp({ element, onMouseDown, onClick, style, isSelected }: Props) {
  return (
    <div
      style={{
        ...style,
        outline: isSelected ? '2px solid #7C6AF7' : '2px solid transparent',
        borderRadius: 4,
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(124, 106, 247, 0.15)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <LinkIcon style={{ fontSize: 14, color: element.color, flexShrink: 0, pointerEvents: 'none' }} />
      <span
        style={{
          color: element.color,
          fontSize: 13,
          fontFamily: 'Inter, Roboto, sans-serif',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {element.label || element.url}
      </span>
    </div>
  );
}
