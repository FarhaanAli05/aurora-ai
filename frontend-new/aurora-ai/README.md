# Aurora AI Frontend

Modern Next.js frontend for Aurora AI image enhancement studio.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React 19**

## Getting Started

```bash
npm install

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  ├── layout.tsx          # Root layout
  ├── page.tsx            # Home page
  └── globals.css         # Global styles

components/
  ├── ToolPalette.tsx     # Left sidebar with tool cards
  ├── ToolCard.tsx        # Individual tool card
  ├── MainEditorPanel.tsx # Main editing area
  ├── ImageUpload.tsx     # Image upload component
  ├── EmptyState.tsx      # Empty state component
  └── tools/
      ├── EnhanceTool.tsx
      ├── RemoveBgTool.tsx
      ├── ReplaceBgTool.tsx
      └── GenerateBgTool.tsx

types/
  └── index.ts            # TypeScript type definitions
```

## Features

- **Visual Tool Palette**: Left sidebar with rich tool cards
- **Progressive Disclosure**: Only show relevant controls
- **Drag & Drop Upload**: Easy image upload
- **Responsive Design**: Works on desktop and mobile
- **Type Safety**: Full TypeScript coverage

## Adding Tool Thumbnails

Place tool preview images in `public/images/tools/`:
- `enhance.jpg`
- `remove-bg.jpg`
- `replace-bg.jpg`
- `generate-bg.jpg`

The ToolCard component will automatically use these when available.

## Building for Production

```bash
npm run build
npm start
```

## Next Steps

- Connect to FastAPI backend (`/api/process` endpoint)
- Add error handling and loading states
- Implement result download functionality
- Add image preview before/after comparison
