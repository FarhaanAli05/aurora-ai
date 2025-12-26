# Aurora AI Frontend

Modern Next.js frontend for Aurora AI.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React 18**

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



# Aurora AI Frontend

The frontend for Aurora AI, built with Next.js and React. This application provides a modern, responsive interface for AI-powered image editing, including background removal, enhancement, and background replacement.

Tech Stack

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**

> The project tracks the latest stable versions of Next.js and React.

## Getting Started
```bash
npm install
npm run dev
```

Open your browser at:
[http://localhost:3000](http://localhost:3000).

## Project Structure

```
# Aurora AI - Frontend
frontend/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout and metadata
│   ├── page.tsx          # Main editor page
│   └── globals.css       # Global styles & Tailwind directives
├── components/           # React components
│   ├── ToolPalette.tsx   # Sidebar navigation for AI tools
│   ├── ToolCard.tsx      # Tool selection UI component
│   ├── MainEditorPanel.tsx # Core image canvas & preview logic
│   ├── ImageUpload.tsx   # File handling & dropzone logic
│   ├── EmptyState.tsx    # Initial dashboard view
│   ├── Toast.tsx         # Notification system components
│   └── tools/            # Specific AI tool logic
│       ├── EnhanceTool.tsx
│       ├── RemoveBgTool.tsx
│       ├── ReplaceBgTool.tsx
│       └── GenerateBgTool.tsx
├── lib/                  # Utility functions
│   ├── api.ts            # Axios/Fetch wrappers for Python backend
│   └── imageUtils.ts     # Client-side processing (base64, resizing)
├── public/               # Static assets (icons, SVGs, demo images)
├── types/                # Shared TypeScript interfaces
├── tailwind.config.ts    # Custom theme & dark mode config
└── next.config.ts        # Next.js framework configuration
```

## Features

- **Tool-Based Editor**
  - Enhance image
  - Remove background
  - Replace background
  - Generate background with AI
-  **Progressive UX**
  - Tools enable/disable based on image state
  - Clear processing feedback
  - Guarded actions (e.g. download only after processing)
- **Responsive Design**
  - Optimized for desktop and laptop workflows
  - Tailwind-based layout and spacing
- **Type Safety**
  - Full TypeScript coverage
  - Centralized API and utility layers

## Backend Integration

The frontend communicates with a FastAPI backend for all AI inference tasks.
API requests are centralized in `lib/api.ts`.

## Development Notes

- No model inference runs in the browser
- All heavy processing is delegated to the backend
- UI state is driven by image lifecycle (uploaded --> processed --> downloadable)

## Building for Production

```bash
npm run build
npm start
```