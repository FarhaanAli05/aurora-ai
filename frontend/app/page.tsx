'use client'

import { useState } from 'react'
import ToolPalette from '@/components/ToolPalette'
import MainEditorPanel from '@/components/MainEditorPanel'
import ToastContainer, { ToastMessage } from '@/components/ToastContainer'
import { Tool } from '@/types'

const TOOLS: Tool[] = [
  {
    id: 'enhance',
    title: 'Enhance Image',
    description: 'Upscale and improve image quality with AI',
    thumbnail: '/images/tools/enhance.webp',
    icon: '/icons/super-scale.svg',
  },
  {
    id: 'remove-bg',
    title: 'Remove Background',
    description: 'One-click background remover, let the AI do the work',
    thumbnail: '/images/tools/remove-bg.webp',
    icon: '/icons/remove-background.svg',
  },
  {
    id: 'replace-bg',
    title: 'Replace Background',
    description: 'Swap backgrounds with images or AI-generated scenes',
    thumbnail: '/images/tools/generate-bg.webp',
    icon: '/icons/backdrop.svg',
  },
  {
    id: 'generate-bg',
    title: 'Generate Background',
    description: 'Create backgrounds from text prompts using AI',
    thumbnail: '/images/tools/generate-bg.jpg',
    icon: '/icons/generate.svg',
    experimental: true,
  },
]

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId)
  }

  const handleImageUpload = (image: string) => {
    setUploadedImage(image || null)
    if (!selectedTool && image) {
      setSelectedTool('enhance')
    }
  }

  const addToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const handleSuccess = (message: string) => {
    addToast(message, 'success')
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden bg-[#0b0f14] text-white"
      style={{ fontFamily: '"Space Grotesk", "Segoe UI", system-ui, sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[760px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary-500/20 via-sky-400/10 to-indigo-500/15 blur-[140px]" />
        <div className="absolute bottom-[-18%] right-[-10%] h-[620px] w-[620px] rounded-full bg-gradient-to-br from-blue-600/20 via-primary-500/10 to-indigo-500/15 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(120deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f14]/70 backdrop-blur-xl">
        <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <div className="relative flex items-center justify-center">
              <img
                src="/icons/aurora-logo.png"
                alt="Aurora AI"
                className="h-10 w-10 rounded-2xl relative z-10"
              />
              <div className="absolute inset-0 rounded-2xl blur-xl bg-gradient-to-br from-primary-400/50 via-sky-500/40 to-indigo-500/40 opacity-80" />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-100">
              Aurora
              <span className="text-primary-300 ml-1">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/FarhaanAli05/aurora-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="w-4 h-4 fill-current opacity-80 group-hover:opacity-100 transition-opacity"
              >
                <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56v-2.1c-3.2.7-3.88-1.55-3.88-1.55-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.18.93-.26 1.93-.39 2.92-.39s1.99.13 2.92.39c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.77.11 3.06.75.81 1.2 1.84 1.2 3.1 0 4.42-2.69 5.39-5.25 5.67.41.36.78 1.07.78 2.15v3.18c0 .31.21.67.79.56 4.57-1.53 7.86-5.85 7.86-10.95C23.5 5.74 18.27.5 12 .5z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 md:px-6 py-6">
        <div className="max-w-[1500px] mx-auto h-full">
          <section className="h-full min-h-[calc(100vh-120px)] rounded-[32px] border border-white/10 bg-[#0b0f14]/80 backdrop-blur-xl shadow-[0_30px_80px_rgba(7,10,16,0.6)] overflow-hidden">
            <div className="flex h-full min-h-0 overflow-hidden app-body flex-col md:flex-row">
              <ToolPalette
                tools={TOOLS}
                selectedTool={selectedTool}
                onToolSelect={handleToolSelect}
              />
              <MainEditorPanel
                selectedTool={selectedTool}
                uploadedImage={uploadedImage}
                onImageUpload={handleImageUpload}
                onError={addToast}
                onSuccess={handleSuccess}
              />
            </div>
          </section>
        </div>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
