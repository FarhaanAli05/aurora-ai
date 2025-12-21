'use client'

import { useState } from 'react'
import ToolPalette from '@/components/ToolPalette'
import MainEditorPanel from '@/components/MainEditorPanel'
import { Tool } from '@/types'

const TOOLS: Tool[] = [
  {
    id: 'enhance',
    title: 'Enhance Image',
    description: 'Upscale and improve image quality with AI',
    icon: '✨',
    thumbnail: '/images/tools/enhance.jpg',
  },
  {
    id: 'remove-bg',
    title: 'Remove Background',
    description: 'One-click background remover, let the AI do the work',
    icon: '✂️',
    thumbnail: '/images/tools/remove-bg.jpg',
  },
  {
    id: 'replace-bg',
    title: 'Replace Background',
    description: 'Swap backgrounds with images or AI-generated scenes',
    icon: '🖼️',
    thumbnail: '/images/tools/replace-bg.jpg',
  },
  {
    id: 'generate-bg',
    title: 'Generate Background',
    description: 'Create backgrounds from text prompts using AI',
    icon: '🎨',
    thumbnail: '/images/tools/generate-bg.jpg',
    experimental: true,
  },
]

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [hasTransparentBg, setHasTransparentBg] = useState(false)

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId)
  }

  const handleImageUpload = (image: string) => {
    setUploadedImage(image)
  }

  const handleBackgroundRemoved = () => {
    setHasTransparentBg(true)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ToolPalette
        tools={TOOLS}
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
      />
      <MainEditorPanel
        selectedTool={selectedTool}
        uploadedImage={uploadedImage}
        hasTransparentBg={hasTransparentBg}
        onImageUpload={handleImageUpload}
        onBackgroundRemoved={handleBackgroundRemoved}
      />
    </div>
  )
}
