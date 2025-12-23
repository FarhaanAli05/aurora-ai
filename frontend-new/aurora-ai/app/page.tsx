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
    thumbnail: '/images/tools/generate-bg.webp',
    icon: '/icons/backdrop.svg',
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
    setUploadedImage(image)
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
    <div className="flex h-screen overflow-hidden bg-[#0f1115]">
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
