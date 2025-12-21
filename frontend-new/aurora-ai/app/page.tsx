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
    thumbnail: '/images/tools/enhance.webp',
  },
  {
    id: 'remove-bg',
    title: 'Remove Background',
    description: 'One-click background remover, let the AI do the work',
    thumbnail: '/images/tools/remove-bg.webp',
  },
  {
    id: 'replace-bg',
    title: 'Replace Background',
    description: 'Swap backgrounds with images or AI-generated scenes',
    thumbnail: '/images/tools/generate-bg.webp',
  },
  {
    id: 'generate-bg',
    title: 'Generate Background',
    description: 'Create backgrounds from text prompts using AI',
    thumbnail: '/images/tools/generate-bg.webp',
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
    <div className="flex h-screen overflow-hidden bg-[#0f1115]">
      <ToolPalette
        tools={TOOLS}
        selectedTool={selectedTool}
        onToolSelect={handleToolSelect}
        hasTransparentBg={hasTransparentBg}
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
