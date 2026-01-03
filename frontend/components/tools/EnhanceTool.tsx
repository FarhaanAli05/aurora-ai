'use client'

import { useState } from 'react'
import { processImage } from '@/lib/api'
import { Sparkles, Zap, Maximize2 } from 'lucide-react'

interface EnhanceToolProps {
  uploadedImage: string
  isProcessing: boolean
  onProcessingStart: () => void
  onProcessingComplete: (result: string) => void
  onProcessingError: (error: Error | string) => void
  disabled?: boolean
}

export default function EnhanceTool({
  uploadedImage,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
  disabled = false,
}: EnhanceToolProps) {
  const [quality, setQuality] = useState<'fast' | 'hq'>('fast')

  const handleProcess = async () => {
    onProcessingStart()

    try {
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })

      const scale = quality === 'fast' ? 2 : 4
      const mode = scale === 2 ? 'enhance_2x' : 'enhance_4x'

      const resultBlob = await processImage(file, { mode })
      const objectUrl = URL.createObjectURL(resultBlob)

      onProcessingComplete(objectUrl)
    } catch (error) {
      if (error instanceof Error) {
        onProcessingError(error.message)
      } else {
        onProcessingError('Failed to enhance image. Please try again.')
      }
    }
  }

  return (
    <section className="space-y-6 animate-in">
      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-600/15 text-primary-400 flex items-center justify-center">
            <Maximize2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold tracking-tight">
                Enhance Image
              </h3>
              <span className="text-xs text-white/50">&lt;1 min</span>
            </div>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              Upscale your image with AI-powered super-resolution. Sharper details,
              cleaner edges, and higher clarity - no artifacts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setQuality('fast')}
            disabled={isProcessing || disabled}
            className={`
              relative rounded-xl border p-4 text-left transition-all
              ${quality === 'fast'
                ? 'border-primary-500 bg-primary-600/10'
                : 'border-[#2d3239] hover:border-primary-500/40 hover:bg-[#252932]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-600/15 text-primary-400 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-medium text-sm">Fast 2x</p>
                <p className="text-xs text-[#9ca3af]">
                  Quick enhancement with balanced quality
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setQuality('hq')}
            disabled={isProcessing || disabled}
            className={`
              relative rounded-xl border p-4 text-left transition-all
              ${quality === 'hq'
                ? 'border-primary-500 bg-primary-600/10'
                : 'border-[#2d3239] hover:border-primary-500/40 hover:bg-[#252932]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-600/15 text-primary-400 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-medium text-sm">High Quality 4x</p>
                <p className="text-xs text-[#9ca3af]">
                  Maximum detail, slower processing
                </p>
              </div>
            </div>
          </button>
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
                  Enhancing image...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Enhance Image
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
          { title: 'Super-Resolution', desc: 'AI upscaling without blur' },
          { title: 'Detail-Preserving', desc: 'Sharp edges & textures' },
          { title: 'Flexible', desc: 'Choose speed or quality' },
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
