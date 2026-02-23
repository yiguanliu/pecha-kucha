import { supabase } from './supabase';
import type { Presentation, PresentationRow } from '../types/presentation';

function fromRow(row: PresentationRow): Presentation {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    authorName: row.author_name ?? '',
    slides: row.slides,
    format: {
      slides: row.format_slides,
      duration: row.format_duration,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: row.tags ?? [],
    isPublished: row.is_published,
  };
}

export async function getPublishedPresentations(): Promise<Presentation[]> {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as PresentationRow[]).map(fromRow);
}

export async function getPresentationById(id: string): Promise<Presentation> {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return fromRow(data as PresentationRow);
}

export async function upsertPresentation(p: Presentation): Promise<Presentation> {
  const { data: { user } } = await supabase.auth.getUser();
  const row = {
    id: p.id,
    user_id: user?.id,
    title: p.title,
    description: p.description,
    author_name: p.authorName,
    slides: p.slides,
    format_slides: p.format.slides,
    format_duration: p.format.duration,
    tags: p.tags,
    is_published: p.isPublished,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('presentations')
    .upsert(row)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as PresentationRow);
}

export async function deletePresentation(id: string): Promise<void> {
  const { error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function uploadSlideImage(
  file: File,
  presentationId: string
): Promise<string> {
  const path = `${presentationId}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage
    .from('slide-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('slide-images').getPublicUrl(path);
  return data.publicUrl;
}
