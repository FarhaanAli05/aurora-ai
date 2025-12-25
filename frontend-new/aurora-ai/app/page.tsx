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
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#0f1115]">
      <header className="
        shrink-0 sticky top-0 z-40
        bg-[#0f1115]/70 backdrop-blur-xl
        border-b border-white/5
      ">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/icons/aurora-logo.png"
                alt="Aurora AI"
                className="h-9 w-9 rounded-xl"
              />
              <div className="absolute inset-0 rounded-xl blur-lg bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-fuchsia-500/30 -z-10" />
            </div>

            <div className="leading-tight">
              <h1 className="text-xl md:text-2xl font-semibold text-[#e5e7eb] tracking-tight">
                Aurora<span className="text-primary-400 ml-1">AI</span>
              </h1>
              <p className="hidden sm:block text-xs text-[#9ca3af]">
                AI image editing, refined
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/FarhaanAli05/aurora-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="
                group flex items-center gap-2
                px-4 py-2 rounded-xl
                text-sm font-medium
                bg-[#0b0d12] text-[#e5e7eb]
                border border-white/10
                hover:border-white/20
                hover:bg-[#111318]
                transition-all
              "
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
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
      </header>

      <div className="flex flex-1 overflow-hidden max-w-[1400px] w-full mx-auto app-body flex-col md:flex-row bg-[#0b0d12]/80 backdrop-blur-xl border-r border-white/5">
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
