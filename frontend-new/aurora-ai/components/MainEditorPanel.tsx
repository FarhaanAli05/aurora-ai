'use client'

import { useState } from 'react'
import ImageUpload from './ImageUpload'
import EmptyState from './EmptyState'
import EnhanceTool from './tools/EnhanceTool'
import RemoveBgTool from './tools/RemoveBgTool'
import ReplaceBgTool from './tools/ReplaceBgTool'

interface MainEditorPanelProps {
  selectedTool: string | null
  uploadedImage: string | null
  hasTransparentBg: boolean
  onImageUpload: (image: string) => void
  onBackgroundRemoved: () => void
  onError?: (message: string) => void
}

export default function MainEditorPanel({
  selectedTool,
  uploadedImage,
  hasTransparentBg,
  onImageUpload,
  onBackgroundRemoved,
  onError,
}: MainEditorPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)

  const handleProcessingStart = () => {
    setIsProcessing(true)
    setProcessedImage(null)
  }

  const handleProcessingComplete = (result: string) => {
    setIsProcessing(false)
    setProcessedImage(result)
  }

  const handleProcessingError = (error: Error | string) => {
    setIsProcessing(false)
    const errorMessage = typeof error === 'string' ? error : error.message
    console.error('Processing error:', errorMessage)
    if (onError) {
      onError(errorMessage)
    }
  }

  const renderToolContent = () => {
    if (!selectedTool) {
      return <EmptyState />
    }

    if (!uploadedImage) {
      return <ImageUpload onImageUpload={onImageUpload} />
    }

    const commonProps = {
      uploadedImage,
      isProcessing,
      onProcessingStart: handleProcessingStart,
      onProcessingComplete: handleProcessingComplete,
      onProcessingError: handleProcessingError,
    }

    switch (selectedTool) {
      case 'enhance':
        return <EnhanceTool {...commonProps} />
      case 'remove-bg':
        return (
          <RemoveBgTool
            {...commonProps}
            onBackgroundRemoved={onBackgroundRemoved}
          />
        )
      case 'replace-bg':
        return (
          <ReplaceBgTool
            {...commonProps}
            hasTransparentBg={hasTransparentBg}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#0f1115]">
      <header className="bg-[#181b23] border-b border-[#2d3239] px-6 py-4">
        <h1 className="text-xl font-semibold text-[#e5e7eb]">
          {selectedTool
            ? selectedTool
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            : 'Aurora AI'}
        </h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {renderToolContent()}
          {processedImage && (
            <div className="mt-6 card p-6">
              <h3 className="text-lg font-semibold text-[#e5e7eb] mb-4">
                Result
              </h3>
              <div className="rounded-lg overflow-hidden border border-[#2d3239] mb-4">
                <img
                  src={processedImage}
                  alt="Processed result"
                  className="w-full h-auto"
                />
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary">Download</button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setProcessedImage(null)
                    setIsProcessing(false)
                  }}
                >
                  Process Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

