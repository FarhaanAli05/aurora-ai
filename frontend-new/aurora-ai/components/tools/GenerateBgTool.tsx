'use client'

import { useState } from 'react'
import { processImage } from '@/lib/api'
import { compositeImages } from '@/lib/imageUtils'

interface GenerateBgToolProps {
  uploadedImage: string
  hasTransparency?: boolean
  isProcessing: boolean
  onProcessingStart: () => void
  onProcessingComplete: (result: string) => void
  onProcessingError: (error: Error | string) => void
}

export default function GenerateBgTool({
  uploadedImage,
  hasTransparency = false,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
}: GenerateBgToolProps) {
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState<'fast' | 'hq'>('fast')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onProcessingError('Please enter a prompt to generate a background')
      return
    }

    onProcessingStart()

    try {
      const response = await fetch(uploadedImage)
      const blob = await response.blob()
      const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })

      const resultBlob = await processImage(file, {
        mode: 'remove_background',
        bgType: 'generate',
        bgPrompt: prompt.trim(),
        bgQuality: quality,
      })

      const objectUrl = URL.createObjectURL(resultBlob)
      onProcessingComplete(objectUrl)
    } catch (error) {
      if (error instanceof Error) {
        onProcessingError(error.message)
      } else if (typeof error === 'string') {
        onProcessingError(error)
      } else {
        onProcessingError(
          'Background generation failed. The GPU queue may be busy. Please try again in a moment.'
        )
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-amber-400 font-semibold text-xs uppercase tracking-wide">
            Experimental
          </span>
          <p className="text-sm text-[#9ca3af] flex-1">
            This feature uses AI to generate backgrounds. Results may vary and
            generation can take 30-60 seconds.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="bg-prompt"
          className="block text-sm font-semibold text-[#e5e7eb] mb-2"
        >
          Describe Your Background
        </label>
        <textarea
          id="bg-prompt"
          className="w-full px-4 py-3 bg-[#181b23] border border-[#2d3239] rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-[#e5e7eb] placeholder:text-[#6b7280]"
          placeholder="e.g., sunset over mountains, abstract blue gradient, modern office space"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
        <p className="text-xs text-[#6b7280] mt-2">
          Be specific for better results. Describe colors, mood, and style.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#e5e7eb] mb-3">
          Generation Quality
        </label>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border border-[#2d3239] rounded-lg cursor-pointer hover:border-primary-500/50 hover:bg-[#252932] transition-colors">
            <input
              type="radio"
              name="gen_quality"
              value="fast"
              checked={quality === 'fast'}
              onChange={(e) => setQuality(e.target.value as 'fast' | 'hq')}
              className="mt-1 accent-primary-600"
            />
            <div className="flex-1">
              <div className="font-medium text-[#e5e7eb]">
                Fast (Recommended)
              </div>
              <div className="text-sm text-[#9ca3af] mt-1">
                Quick generation with good quality
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-4 border border-[#2d3239] rounded-lg cursor-pointer hover:border-primary-500/50 hover:bg-[#252932] transition-colors">
            <input
              type="radio"
              name="gen_quality"
              value="hq"
              checked={quality === 'hq'}
              onChange={(e) => setQuality(e.target.value as 'fast' | 'hq')}
              className="mt-1 accent-primary-600"
            />
            <div className="flex-1">
              <div className="font-medium text-[#e5e7eb]">
                High Quality (Slower)
              </div>
              <div className="text-sm text-[#9ca3af] mt-1">
                Better detail, takes longer to generate
              </div>
            </div>
          </label>
        </div>
      </div>

      <button
        className="btn btn-primary w-full py-3 text-base font-semibold"
        onClick={handleGenerate}
        disabled={isProcessing || !prompt.trim()}
      >
        {isProcessing ? 'Generating Background...' : 'Generate & Apply'}
      </button>

      {isProcessing && (
          <div className="flex flex-col items-center gap-3 p-6 bg-[#181b23] rounded-lg border border-[#2d3239]">
            <div className="w-8 h-8 border-2 border-[#2d3239] border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-[#9ca3af]">
            Generating your background... This may take 30-60 seconds.
          </p>
        </div>
      )}
    </div>
  )
}

