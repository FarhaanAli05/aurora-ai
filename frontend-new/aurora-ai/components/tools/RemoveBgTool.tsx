'use client'

import { processImage } from '@/lib/api'
import { Sparkles, Wand2 } from 'lucide-react'

interface RemoveBgToolProps {
  uploadedImage: string
  isProcessing: boolean
  onProcessingStart: () => void
  onProcessingComplete: (result: string) => void
  onProcessingError: (error: Error | string) => void
  disabled?: boolean
}

export default function RemoveBgTool({
  uploadedImage,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
  disabled = false,
}: RemoveBgToolProps) {
  const handleProcess = async () => {
    onProcessingStart()

    try {
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })

      const resultBlob = await processImage(file, { mode: 'remove_background' })
      const objectUrl = URL.createObjectURL(resultBlob)

      onProcessingComplete(objectUrl)
    } catch (error) {
      if (error instanceof Error) {
        onProcessingError(error.message)
      } else {
        onProcessingError('Failed to remove background. Please try again.')
      }
    }
  }

  return (
    <section className="space-y-6 animate-in">
      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-600/15 text-primary-400 flex items-center justify-center">
            <Wand2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight">
              Remove Background
            </h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              Instantly isolate your subject with pixel-accurate edges. Export a clean transparent PNG ready for design or compositing.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleProcess}
            disabled={isProcessing || disabled}
            className={`
              relative w-full overflow-hidden rounded-xl
              px-6 py-3.5 font-semibold text-sm
              transition-all duration-300
              ${isProcessing
                ? 'bg-primary-600/60 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400'
              }
            `}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Removing background…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Remove Background
                </>
              )}
            </span>

            {!isProcessing && (
              <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {[
          { title: 'Transparent PNG', desc: 'Perfect cut-outs every time' },
          { title: 'AI-Powered', desc: 'Handles hair & fine details' },
          { title: 'Fast', desc: 'Results in seconds' },
        ].map((item) => (
          <div
            key={item.title}
            className="card p-4 text-center space-y-1"
          >
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-[#9ca3af]">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
