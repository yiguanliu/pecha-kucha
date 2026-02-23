export type ElementType = 'text' | 'image' | 'link';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;      // percentage of canvas width (0-100)
  y: number;      // percentage of canvas height (0-100)
  width: number;  // percentage of canvas width
  height: number; // percentage of canvas height
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt: string;
  objectFit: 'cover' | 'contain' | 'fill';
}

export interface LinkElement extends BaseElement {
  type: 'link';
  url: string;
  label: string;
  color: string;
}

export type SlideElement = TextElement | ImageElement | LinkElement;

export interface Slide {
  id: string;
  title: string;
  backgroundColor: string;
  backgroundImage?: string;
  elements: SlideElement[];
  notes: string;
}
