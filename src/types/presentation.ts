import type { Slide } from './slide';

export interface PresentationFormat {
  slides: number;
  duration: number;
}

export interface Presentation {
  id: string;
  title: string;
  description: string;
  authorName: string;
  slides: Slide[];
  format: PresentationFormat;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPublished: boolean;
}

export interface PresentationRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  author_name: string | null;
  slides: Slide[];
  format_slides: number;
  format_duration: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  tags: string[] | null;
}
