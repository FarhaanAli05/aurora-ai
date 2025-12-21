'use client'

import { useState, useEffect } from 'react'
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
  onSuccess?: (message: string) => void
}

export default function MainEditorPanel({
  selectedTool,
  uploadedImage,
  hasTransparentBg,
  onImageUpload,
  onBackgroundRemoved,
  onError,
  onSuccess,
}: MainEditorPanelProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (uploadedImage) {
      if (originalImage && originalImage.startsWith('blob:')) {
        URL.revokeObjectURL(originalImage)
      }
      if (currentImage && currentImage.startsWith('blob:') && currentImage !== originalImage) {
        URL.revokeObjectURL(currentImage)
      }
      
      setOriginalImage(uploadedImage)
      setCurrentImage(uploadedImage)
    }
  }, [uploadedImage])

  useEffect(() => {
    return () => {
      if (originalImage && originalImage.startsWith('blob:')) {
        URL.revokeObjectURL(originalImage)
      }
      if (currentImage && currentImage.startsWith('blob:') && currentImage !== originalImage) {
        URL.revokeObjectURL(currentImage)
      }
    }
  }, [originalImage, currentImage])

  const handleProcessingStart = () => {
    setIsProcessing(true)
  }

  const handleProcessingComplete = (result: string) => {
    setIsProcessing(false)
    
    if (currentImage && currentImage.startsWith('blob:') && currentImage !== originalImage) {
      URL.revokeObjectURL(currentImage)
    }
    
    setCurrentImage(result)
    
    if (onSuccess) {
      if (selectedTool === 'remove-bg') {
        onSuccess('Background removed successfully!')
      } else if (selectedTool === 'enhance') {
        onSuccess('Image enhanced successfully!')
      } else if (selectedTool === 'replace-bg') {
        onSuccess('Background replaced successfully!')
      }
    }
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

    if (!uploadedImage || !currentImage) {
      return <ImageUpload onImageUpload={onImageUpload} />
    }

    const commonProps = {
      uploadedImage: currentImage,
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
          {currentImage && (
            <div className="mt-6 card p-6">
              <h3 className="text-lg font-semibold text-[#e5e7eb] mb-4">
                {isProcessing ? 'Processing...' : originalImage && currentImage !== originalImage ? 'Current Image' : 'Image'}
              </h3>
              <div className="rounded-lg overflow-hidden border border-[#2d3239] mb-4">
                <img
                  src={currentImage}
                  alt={isProcessing ? 'Processing' : 'Current image'}
                  className="w-full h-auto"
                />
              </div>
              <div className="flex gap-3">
                <a
                  href={currentImage}
                  download="aurora-result.png"
                  className="btn btn-primary"
                >
                  Download
                </a>
                {originalImage && currentImage !== originalImage && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (currentImage && currentImage.startsWith('blob:') && currentImage !== originalImage) {
                        URL.revokeObjectURL(currentImage)
                      }
                      setCurrentImage(originalImage)
                    }}
                  >
                    Reset to Original
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

