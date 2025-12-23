'use client'

import { useState, useEffect, useRef } from 'react'
import ReactBeforeSliderComponent from 'react-before-after-slider-component'
import 'react-before-after-slider-component/dist/build.css'
import ImageUpload from './ImageUpload'
import EmptyState from './EmptyState'
import EnhanceTool from './tools/EnhanceTool'
import RemoveBgTool from './tools/RemoveBgTool'
import ReplaceBgTool from './tools/ReplaceBgTool'
import { prepareImagesForComparison } from '@/lib/imageUtils'

interface MainEditorPanelProps {
  selectedTool: string | null
  uploadedImage: string | null
  onImageUpload: (image: string) => void
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
}

export default function MainEditorPanel({
  selectedTool,
  uploadedImage,
  onImageUpload,
  onError,
  onSuccess,
}: MainEditorPanelProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [compareBeforeUrl, setCompareBeforeUrl] = useState<string | null>(null)
  const [compareAfterUrl, setCompareAfterUrl] = useState<string | null>(null)
  const lastUploadedImageRef = useRef<string | null>(null)

  useEffect(() => {
    if (uploadedImage && uploadedImage !== lastUploadedImageRef.current) {
      const prevOriginal = lastUploadedImageRef.current
      
      setOriginalImage((prevOrig) => {
        if (prevOrig && prevOrig.startsWith('blob:') && prevOrig !== prevOriginal) {
          URL.revokeObjectURL(prevOrig)
        }
        return uploadedImage
      })
      
      setCurrentImage((prevCurrent) => {
        if (prevCurrent && prevCurrent.startsWith('blob:') && prevCurrent !== prevOriginal) {
          URL.revokeObjectURL(prevCurrent)
        }
        return uploadedImage
      })
      
      setIsCompareMode(false)
      lastUploadedImageRef.current = uploadedImage
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

  useEffect(() => {
    return () => {
      if (compareBeforeUrl && compareBeforeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(compareBeforeUrl)
      }
      if (compareAfterUrl && compareAfterUrl.startsWith('blob:')) {
        URL.revokeObjectURL(compareAfterUrl)
      }
    }
  }, [compareBeforeUrl, compareAfterUrl])

  useEffect(() => {
    if (isCompareMode && originalImage && currentImage && currentImage !== originalImage) {
      let cancelled = false

      prepareImagesForComparison(originalImage, currentImage, '#181b23')
        .then(({ before, after }: { before: string; after: string }) => {
          if (!cancelled) {
            if (compareBeforeUrl && compareBeforeUrl.startsWith('blob:')) {
              URL.revokeObjectURL(compareBeforeUrl)
            }
            if (compareAfterUrl && compareAfterUrl.startsWith('blob:')) {
              URL.revokeObjectURL(compareAfterUrl)
            }
            setCompareBeforeUrl(before)
            setCompareAfterUrl(after)
          } else {
            URL.revokeObjectURL(before)
            URL.revokeObjectURL(after)
          }
        })
        .catch((error: Error) => {
          console.error('Failed to prepare images for comparison:', error)
          if (onError) {
            onError('Failed to prepare comparison. Please try again.')
          }
        })
      
      return () => {
        cancelled = true
      }
    } else {
      if (compareBeforeUrl && compareBeforeUrl.startsWith('blob:')) {
        URL.revokeObjectURL(compareBeforeUrl)
      }
      if (compareAfterUrl && compareAfterUrl.startsWith('blob:')) {
        URL.revokeObjectURL(compareAfterUrl)
      }
      setCompareBeforeUrl(null)
      setCompareAfterUrl(null)
    }
  }, [isCompareMode, originalImage, currentImage])

  const handleProcessingStart = () => {
    setIsProcessing(true)
  }

  const handleProcessingComplete = (result: string) => {
    setIsProcessing(false)
    
    setCurrentImage(result)
    setIsCompareMode(false)
    
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
    const isTimeout = errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('timed out')
    
    console.error('Processing error:', errorMessage)
    
    if (onError) {
      if (isTimeout) {
        onError(
          'Operation timed out. The request did not complete. ' +
          'Your image has not been modified. Please try again with a smaller image or different settings.'
        )
      } else {
        onError(errorMessage)
      }
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
          />
        )
      case 'replace-bg':
      case 'generate-bg':
        return (
          <ReplaceBgTool
            {...commonProps}
            initialBgType={selectedTool === 'generate-bg' ? 'generate' : 'upload'}
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
          {currentImage && originalImage && (
            <div className="mb-6 card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#e5e7eb]">
                  {isProcessing
                    ? 'Processing...'
                    : originalImage && currentImage !== originalImage
                    ? 'Current Image'
                    : 'Image'}
                </h3>
                {currentImage !== originalImage && !isProcessing && (
                    <button
                      className="btn btn-secondary text-sm"
                      onClick={() => setIsCompareMode(!isCompareMode)}
                    >
                      {isCompareMode ? 'Exit Compare' : 'Compare'}
                    </button>
                  )}
              </div>
              <div className="rounded-lg overflow-hidden border border-[#2d3239] mb-4 bg-[#181b23]">
                {isCompareMode &&
                originalImage &&
                currentImage &&
                currentImage !== originalImage &&
                compareBeforeUrl &&
                compareAfterUrl ? (
                  <div className="relative w-full [&_.react-before-after-slider-component]:rounded-lg">
                    <ReactBeforeSliderComponent
                      firstImage={{
                        imageUrl: compareBeforeUrl,
                        alt: 'Previous image',
                      }}
                      secondImage={{
                        imageUrl: compareAfterUrl,
                        alt: 'Current image',
                      }}
                      delimiterColor="#3b82f6"
                      currentPercentPosition={50}
                      withResizeFeel={true}
                    />
                  </div>
                ) : isCompareMode && currentImage !== originalImage ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="w-8 h-8 border-2 border-[#2d3239] border-t-primary-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <img
                    src={currentImage}
                    alt={isProcessing ? 'Processing' : 'Current image'}
                    className="w-full h-auto"
                  />
                )}
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
                      setIsCompareMode(false)
                    }}
                  >
                    Reset to Original
                  </button>
                )}
              </div>
            </div>
          )}
          {renderToolContent()}
        </div>
      </div>
    </main>
  )
}

