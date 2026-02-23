# Pecha Kucha Presentation App

A modern web application for creating, editing, and presenting Pecha Kucha-style presentations. Built with React, TypeScript, and Vite.

## Features

- Slide editor with canvas and properties panel
- Presentation timer and mode
- Inspiration library
- Markdown support
- Authentication (Supabase)
- Theme customization

## Project Structure

```
index.html
package.json
tsconfig*.json
vite.config.ts
src/
  App.tsx
  main.tsx
  components/
    common/
    editor/
    library/
    presentation/
  context/
  hooks/
  pages/
  services/
  theme/
  types/
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env.local` file for local development. Example:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

## License

MIT
