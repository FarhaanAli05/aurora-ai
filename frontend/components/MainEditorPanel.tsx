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
    if (uploadedImage !== lastUploadedImageRef.current) {
      const prevOriginal = lastUploadedImageRef.current

      if (!uploadedImage || uploadedImage === '') {
        setOriginalImage((prevOrig) => {
          if (prevOrig && prevOrig.startsWith('blob:')) {
            URL.revokeObjectURL(prevOrig)
          }
          return null
        })

        setCurrentImage((prevCurrent) => {
          if (prevCurrent && prevCurrent.startsWith('blob:')) {
            URL.revokeObjectURL(prevCurrent)
          }
          return null
        })

        setIsCompareMode(false)
        lastUploadedImageRef.current = null
      } else {
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
    if (!uploadedImage || !currentImage) {
      return (
        <EmptyState
          selectedTool={selectedTool}
          onImageUpload={onImageUpload}
        />
      )
    }

    const commonProps = {
      uploadedImage: currentImage,
      isProcessing,
      onProcessingStart: handleProcessingStart,
      onProcessingComplete: handleProcessingComplete,
      onProcessingError: handleProcessingError,
      disabled: isProcessing,
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

  const getToolName = () => {
    if (!selectedTool) return null
    const toolNames: Record<string, string> = {
      'enhance': 'Enhance Image',
      'remove-bg': 'Remove Background',
      'replace-bg': 'Replace Background',
      'generate-bg': 'Generate Background',
    }
    return toolNames[selectedTool] || null
  }

  return (
    <main className="relative flex-1 flex flex-col overflow-hidden bg-[#0f1115]">
      {/* Ambient editor glow */}
      {/* <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute -top-48 left-1/2 -translate-x-1/2
            w-[900px] h-[900px]
            bg-gradient-to-br
            from-cyan-500/10
            via-blue-500/5
            to-fuchsia-500/10
            blur-[140px]
          "
        />
      </div> */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '1rem' }}>
        <div className="relative max-w-3xl mx-auto space-y-4">
          {currentImage && originalImage && selectedTool && (
            <div className="mb-2">
              <h2 className="text-lg font-semibold text-[#e5e7eb]">{getToolName()}</h2>
            </div>
          )}
          {currentImage && originalImage && (
            <div className="mb-3 card p-4">
              <div className="flex items-center justify-between mb-2">
                {!isProcessing && currentImage !== originalImage && (
                  <button
                    className="btn btn-secondary text-sm flex items-center gap-1.5"
                    onClick={() => setIsCompareMode(!isCompareMode)}
                    title={isCompareMode ? 'Exit Compare' : 'Compare'}
                  >
                    <img src="/icons/compare.svg" alt="" className="w-4 h-4" />
                    {isCompareMode ? 'Exit Compare' : 'Compare'}
                  </button>
                )}
              </div>
              <div
                className="
                  relative mb-4
                  rounded-3xl
                  border border-white/10
                  bg-[#0b0d12]
                  overflow-hidden
                  transition-all
                "
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!isProcessing) {
                    e.currentTarget.classList.add('border-primary-500', 'bg-primary-500/5')
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.currentTarget.classList.remove('border-primary-500', 'bg-primary-500/5')
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.currentTarget.classList.remove('border-primary-500', 'bg-primary-500/5')
                  if (!isProcessing && e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0]
                    if (file.type.startsWith('image/')) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          onImageUpload(event.target.result as string)
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }
                }}
              >
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
                  <div className="
                    rounded-2xl overflow-hidden
                    bg-[#0b0d12]
                    shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                    border border-white/5
                  ">
                    <img
                      src={currentImage}
                      alt={isProcessing ? 'Processing' : 'Current image'}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-white/5 pointer-events-none" />
                    {isProcessing && (
                      <div className="
                        absolute inset-0
                        bg-gradient-to-br
                        from-black/70 via-black/60 to-black/70
                        backdrop-blur-sm
                        flex items-center justify-center
                        pointer-events-none
                      ">                    
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-white font-semibold text-base">Processing...</div>
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"
                                style={{
                                  animationDelay: `${i * 0.2}s`,
                                  animationDuration: '1s',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {!isProcessing && currentImage !== originalImage && (
                  <a
                    href={currentImage}
                    download="aurora-result.png"
                    className="btn btn-primary flex items-center gap-1.5"
                    title="Download image"
                  >
                    <img src="/icons/download.svg" alt="" className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                )}
                {originalImage && currentImage !== originalImage && (
                  <button
                    className="btn btn-secondary flex items-center gap-1.5"
                    onClick={() => {
                      if (currentImage && currentImage.startsWith('blob:') && currentImage !== originalImage) {
                        URL.revokeObjectURL(currentImage)
                      }
                      setCurrentImage(originalImage)
                      setIsCompareMode(false)
                    }}
                    disabled={isProcessing}
                  >
                    <img src="/icons/redo.svg" alt="" className="w-4 h-4" />
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

