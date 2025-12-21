'use client'

import { processImage } from '@/lib/api'

interface RemoveBgToolProps {
  uploadedImage: string
  isProcessing: boolean
  onProcessingStart: () => void
  onProcessingComplete: (result: string) => void
  onProcessingError: (error: Error | string) => void
  onBackgroundRemoved: () => void
}

export default function RemoveBgTool({
  uploadedImage,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
  onBackgroundRemoved,
}: RemoveBgToolProps) {
  const handleProcess = async () => {
    onProcessingStart()

    try {
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })

      const resultBlob = await processImage(file, { mode: 'remove_background' })

      const objectUrl = URL.createObjectURL(resultBlob)

      onBackgroundRemoved()

      onProcessingComplete(objectUrl)
    } catch (error) {
      if (error instanceof Error) {
        onProcessingError(error.message)
      } else if (typeof error === 'string') {
        onProcessingError(error)
      } else {
        onProcessingError('Failed to remove background. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-6">
        <div>
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Remove the background from your image instantly. The result will be
            a transparent PNG perfect for compositing.
          </p>
        </div>

        <button
          className="btn btn-primary w-full py-3 text-base font-semibold"
          onClick={handleProcess}
          disabled={isProcessing}
        >
          {isProcessing ? 'Removing Background...' : 'Remove Background'}
        </button>

        {isProcessing && (
          <div className="flex flex-col items-center gap-3 p-6 bg-[#181b23] rounded-lg border border-[#2d3239]">
            <div className="w-8 h-8 border-2 border-[#2d3239] border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm text-[#9ca3af]">Processing your image...</p>
          </div>
        )}
      </div>
    </div>
  )
}

