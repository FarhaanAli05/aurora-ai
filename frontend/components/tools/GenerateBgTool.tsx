'use client'

import { useState } from 'react'
import { processImage } from '@/lib/api'
import { Sparkles } from 'lucide-react'

interface GenerateBgToolProps {
  uploadedImage: string
  isProcessing: boolean
  onProcessingStart: () => void
  onProcessingComplete: (result: string) => void
  onProcessingError: (error: Error | string) => void
  onInfo?: (message: string) => void
  disabled?: boolean
}

export default function GenerateBgTool({
  uploadedImage,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
  onInfo,
  disabled = false,
}: GenerateBgToolProps) {
  const [prompt, setPrompt] = useState('')

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
        bgQuality: 'fast',
        onNotice: onInfo,
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">
            Generate Background
          </h3>
          <p className="text-sm text-[#9ca3af] leading-relaxed">
            Generates a new background using AI.
          </p>
        </div>
        <span className="text-xs text-white/50">~1 min</span>
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
          {isProcessing ? 'Generating...' : 'Generate & Apply'}
        </span>

        {!isProcessing && prompt.trim() && (
          <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  )
}
