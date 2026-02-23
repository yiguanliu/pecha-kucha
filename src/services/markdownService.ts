import matter from 'gray-matter';
import type { Presentation } from '../types/presentation';
import type { Slide } from '../types/slide';

export function presentationToMarkdown(p: Presentation): string {
  const frontmatter = [
    '---',
    `title: "${p.title}"`,
    `author: "${p.authorName}"`,
    `created: "${p.createdAt.split('T')[0]}"`,
    `format:`,
    `  slides: ${p.format.slides}`,
    `  duration: ${p.format.duration}`,
    '---',
    '',
  ].join('\n');

  const slideSections = p.slides.map((slide, i) => {
    const imageLines = slide.elements
      .filter((el) => el.type === 'image')
      .map((el) => `![](${'src' in el ? el.src : ''})`)
      .join('\n');

    const linkLines = slide.elements
      .filter((el) => el.type === 'link')
      .map((el) => `**Link:** ${'url' in el ? el.url : ''}`)
      .join('\n');

    const lines = [
      `## Slide ${i + 1}: ${slide.title}`,
      '',
      ...(imageLines ? [imageLines, ''] : []),
      ...(linkLines ? [linkLines, ''] : []),
      ...(slide.notes ? [`**Notes:** ${slide.notes}`, ''] : []),
      '<!-- slide-data',
      JSON.stringify(
        { elements: slide.elements, backgroundColor: slide.backgroundColor },
        null,
        2
      ),
      '-->',
      '',
      '---',
    ];

    return lines.join('\n');
  });

  return frontmatter + slideSections.join('\n');
}

export function markdownToPresentation(raw: string): Presentation {
  const { data: frontmatter, content } = matter(raw);

  const sections = content.split(/^---$/m).filter((s) => s.trim());

  const slides: Slide[] = sections.map((section, i) => {
    const dataMatch = section.match(/<!--\s*slide-data\s*([\s\S]*?)-->/);
    let elements: Slide['elements'] = [];
    let backgroundColor = '#1a1a2e';

    if (dataMatch) {
      try {
        const parsed = JSON.parse(dataMatch[1]) as { elements?: Slide['elements']; backgroundColor?: string };
        elements = parsed.elements ?? [];
        backgroundColor = parsed.backgroundColor ?? '#1a1a2e';
      } catch {
        // malformed JSON in comment — skip
      }
    }

    const titleMatch = section.match(/^##\s+(?:Slide \d+:\s*)?(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `Slide ${i + 1}`;

    const notesMatch = section.match(/\*\*Notes:\*\*\s*(.+)/);
    const notes = notesMatch ? notesMatch[1].trim() : '';

    return {
      id: crypto.randomUUID(),
      title,
      backgroundColor,
      elements,
      notes,
    };
  });

  const fmt = frontmatter.format as { slides?: number; duration?: number } | undefined;

  return {
    id: crypto.randomUUID(),
    title: (frontmatter.title as string | undefined) ?? 'Untitled',
    description: '',
    authorName: (frontmatter.author as string | undefined) ?? '',
    slides,
    format: {
      slides: fmt?.slides ?? 5,
      duration: fmt?.duration ?? 20,
    },
    createdAt: (frontmatter.created as string | undefined) ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    isPublished: false,
  };
}

export async function saveToFile(presentation: Presentation): Promise<void> {
  const markdown = presentationToMarkdown(presentation);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const filename = `${presentation.title.replace(/\s+/g, '-')}.md`;

  if ('showSaveFilePicker' in window) {
    const handle = await (window as Window & { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export async function loadFromFile(file: File): Promise<Presentation> {
  const text = await file.text();
  return markdownToPresentation(text);
}
