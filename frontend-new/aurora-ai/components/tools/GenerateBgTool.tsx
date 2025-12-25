'use client'

import { useState } from 'react'
import { processImage } from '@/lib/api'
import { Sparkles, Zap, Crown } from 'lucide-react'

interface GenerateBgToolProps {
  uploadedImage: string
  isProcessing: boolean
  onProcessingStart: () => void
  onProcessingComplete: (result: string) => void
  onProcessingError: (error: Error | string) => void
  disabled?: boolean
}

export default function GenerateBgTool({
  uploadedImage,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
  disabled = false,
}: GenerateBgToolProps) {
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState<'fast' | 'hq'>('fast')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onProcessingError('Please enter a background description')
      return
    }

    onProcessingStart()

    try {
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      const file = new File([blob], 'image.jpg', {
        type: blob.type || 'image/jpeg',
      })

      const resultBlob = await processImage(file, {
        mode: 'remove_background',
        bgType: 'generate',
        bgPrompt: prompt.trim(),
        bgQuality: quality,
      })

      onProcessingComplete(URL.createObjectURL(resultBlob))
    } catch (error) {
      onProcessingError(
        error instanceof Error
          ? error.message
          : 'Background generation failed. Please try again.'
      )
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-400">
              Experimental feature
            </p>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              AI-generated backgrounds may vary. Generation can take up to 60
              seconds depending on quality.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#e5e7eb]">
          Describe your background
        </label>

        <textarea
          className="
            w-full rounded-xl border border-[#2d3239]
            bg-[#181b23] px-4 py-3 text-sm text-[#e5e7eb]
            placeholder:text-[#6b7280]
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40
            transition resize-none
          "
          rows={3}
          placeholder="e.g. cinematic sunset over mountains, soft studio lighting, futuristic city at night"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isProcessing || disabled}
        />

        <p className="text-xs text-[#6b7280]">
          Tip: include lighting, mood, and style for best results
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setQuality('fast')}
          disabled={isProcessing || disabled}
          className={`
            rounded-xl border p-4 text-left transition-all
            ${
              quality === 'fast'
                ? 'border-primary-500 bg-primary-600/10'
                : 'border-[#2d3239] hover:border-primary-500/40 hover:bg-[#252932]'
            }
          `}
        >
          <div className="flex gap-3">
            <Zap className="w-5 h-5 text-primary-400" />
            <div>
              <p className="font-medium text-sm text-[#e5e7eb]">
                Fast
              </p>
              <p className="text-xs text-[#9ca3af]">
                Quick generation, great quality
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setQuality('hq')}
          disabled={isProcessing || disabled}
          className={`
            rounded-xl border p-4 text-left transition-all
            ${
              quality === 'hq'
                ? 'border-primary-500 bg-primary-600/10'
                : 'border-[#2d3239] hover:border-primary-500/40 hover:bg-[#252932]'
            }
          `}
        >
          <div className="flex gap-3">
            <Crown className="w-5 h-5 text-primary-400" />
            <div>
              <p className="font-medium text-sm text-[#e5e7eb]">
                High Quality
              </p>
              <p className="text-xs text-[#9ca3af]">
                Better detail, slower render
              </p>
            </div>
          </div>
        </button>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isProcessing || disabled || !prompt.trim()}
        className={`
          relative w-full rounded-xl px-6 py-3.5 font-semibold text-sm
          transition-all duration-300 overflow-hidden
          ${
            isProcessing || !prompt.trim()
              ? 'bg-[#2d3239] text-[#6b7280] cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400'
          }
        `}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Sparkles className={`w-4 h-4 ${isProcessing && 'animate-pulse'}`} />
          {isProcessing ? 'Generating background…' : 'Generate & Apply'}
        </span>

        {!isProcessing && prompt.trim() && (
          <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  )
}
