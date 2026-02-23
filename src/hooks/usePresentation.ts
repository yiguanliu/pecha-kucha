import { useState, useCallback } from 'react';
import type { Presentation } from '../types/presentation';
import type { Slide, SlideElement } from '../types/slide';
import { saveToFile } from '../services/markdownService';
import { upsertPresentation } from '../services/presentationService';

function createDefaultSlide(index: number): Slide {
  return {
    id: crypto.randomUUID(),
    title: `Slide ${index + 1}`,
    backgroundColor: '#1a1a2e',
    elements: [],
    notes: '',
  };
}

function createDefaultPresentation(): Presentation {
  return {
    id: crypto.randomUUID(),
    title: 'My Weekly Inspiration',
    description: '',
    authorName: '',
    slides: Array.from({ length: 5 }, (_, i) => createDefaultSlide(i)),
    format: { slides: 5, duration: 20 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    isPublished: false,
  };
}

export function usePresentation(initial?: Presentation) {
  const [presentation, setPresentation] = useState<Presentation>(
    initial ?? createDefaultPresentation()
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const updatePresentation = useCallback((updates: Partial<Presentation>) => {
    setPresentation((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  const updateSlide = useCallback((slideId: string, updates: Partial<Slide>) => {
    setPresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === slideId ? { ...s, ...updates } : s
      ),
      updatedAt: new Date().toISOString(),
    }));
    setIsDirty(true);
  }, []);

  const addElement = useCallback((slideId: string, element: SlideElement) => {
    setPresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === slideId ? { ...s, elements: [...s.elements, element] } : s
      ),
    }));
    setIsDirty(true);
  }, []);

  const updateElement = useCallback(
    (slideId: string, elementId: string, updates: Partial<SlideElement>) => {
      setPresentation((prev) => ({
        ...prev,
        slides: prev.slides.map((s) =>
          s.id === slideId
            ? {
                ...s,
                elements: s.elements.map((el) =>
                  el.id === elementId ? ({ ...el, ...updates } as SlideElement) : el
                ),
              }
            : s
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const removeElement = useCallback((slideId: string, elementId: string) => {
    setPresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === slideId
          ? { ...s, elements: s.elements.filter((el) => el.id !== elementId) }
          : s
      ),
    }));
    setIsDirty(true);
  }, []);

  const addSlide = useCallback((afterIndex: number) => {
    setPresentation((prev) => {
      const newSlide = createDefaultSlide(prev.slides.length);
      const slides = [...prev.slides];
      slides.splice(afterIndex + 1, 0, newSlide);
      return { ...prev, slides, updatedAt: new Date().toISOString() };
    });
    setActiveSlideIndex(afterIndex + 1);
    setIsDirty(true);
  }, []);

  const deleteSlide = useCallback((slideId: string) => {
    setPresentation((prev) => {
      if (prev.slides.length <= 1) return prev; // keep at least 1
      return {
        ...prev,
        slides: prev.slides.filter((s) => s.id !== slideId),
        updatedAt: new Date().toISOString(),
      };
    });
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
    setIsDirty(true);
  }, []);

  const saveLocal = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveToFile(presentation);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [presentation]);

  const publish = useCallback(async () => {
    setIsSaving(true);
    try {
      const updated = { ...presentation, isPublished: true };
      await upsertPresentation(updated);
      setPresentation(updated);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [presentation]);

  const activeSlide = presentation.slides[activeSlideIndex];

  return {
    presentation,
    activeSlide,
    activeSlideIndex,
    setActiveSlideIndex,
    isSaving,
    isDirty,
    updatePresentation,
    updateSlide,
    addElement,
    updateElement,
    removeElement,
    addSlide,
    deleteSlide,
    saveLocal,
    publish,
  };
}
