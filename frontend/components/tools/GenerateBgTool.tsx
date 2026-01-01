'use client'

import { useState, useEffect } from 'react'
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

type BgProvider = 'auto' | 'openvino' | 'lcm'

const PROVIDER_STORAGE_KEY = 'aurora_bg_provider_pref'

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
  const [etaText, setEtaText] = useState<string | null>(null)
  const [bgProvider, setBgProvider] = useState<BgProvider>('auto')

  useEffect(() => {
    const stored = localStorage.getItem(PROVIDER_STORAGE_KEY)
    if (stored === 'auto' || stored === 'openvino' || stored === 'lcm') {
      setBgProvider(stored)
    }
  }, [])

  const handleProviderChange = (provider: BgProvider) => {
    setBgProvider(provider)
    localStorage.setItem(PROVIDER_STORAGE_KEY, provider)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      onProcessingError('Please enter a background description')
      return
    }

    onProcessingStart()
    setEtaText('Typically under 1 minute')

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
        bgProvider: bgProvider,
        onNotice: onInfo,
        onProviderInfo: (info) => {
          setEtaText(info.etaText)
        },
      })

      onProcessingComplete(URL.createObjectURL(resultBlob))
      setEtaText(null)
    } catch (error) {
      setEtaText(null)
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
          <Sparkles className="w-5 h-5 text-amber-300 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">
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

      <div className="space-y-3">
        <label className="text-sm font-semibold text-[#e5e7eb]">
          Provider
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleProviderChange('auto')}
            disabled={isProcessing || disabled}
            className={`
              rounded-lg border px-3 py-2.5 text-left transition-all text-xs
              ${bgProvider === 'auto'
                ? 'border-primary-500 bg-primary-600/10'
                : 'border-[#2d3239] hover:border-primary-500/40 hover:bg-[#252932]'
              }
              ${isProcessing || disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <p className="font-medium">Auto</p>
            <p className="text-[10px] text-[#9ca3af] mt-0.5">Recommended</p>
          </button>
          <button
            onClick={() => handleProviderChange('openvino')}
            disabled={isProcessing || disabled}
            className={`
              rounded-lg border px-3 py-2.5 text-left transition-all text-xs
              ${bgProvider === 'openvino'
                ? 'border-primary-500 bg-primary-600/10'
                : 'border-[#2d3239] hover:border-primary-500/40 hover:bg-[#252932]'
              }
              ${isProcessing || disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <p className="font-medium">OpenVINO</p>
            <p className="text-[10px] text-[#9ca3af] mt-0.5">CPU optimized</p>
          </button>
          <button
            onClick={() => handleProviderChange('lcm')}
            disabled={isProcessing || disabled}
            className={`
              rounded-lg border px-3 py-2.5 text-left transition-all text-xs
              ${bgProvider === 'lcm'
                ? 'border-primary-500 bg-primary-600/10'
                : 'border-[#2d3239] hover:border-primary-500/40 hover:bg-[#252932]'
              }
              ${isProcessing || disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <p className="font-medium">LCM</p>
            <p className="text-[10px] text-[#9ca3af] mt-0.5">Universal</p>
          </button>
        </div>
        <div className="rounded-lg border border-[#2d3239] bg-[#181b23] p-3">
          <p className="text-xs text-[#9ca3af] leading-relaxed">
            {bgProvider === 'auto' && 'Chooses the best available provider'}
            {bgProvider === 'openvino' && 'Optimized on some CPUs; may be faster after warm-up'}
            {bgProvider === 'lcm' && 'Universal CPU; often more consistent'}
            <span className="block mt-1 text-[#6b7280]">Same output quality</span>
          </p>
        </div>
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
        <span className="relative z-10 flex flex-col items-center gap-1">
          <span className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${isProcessing && 'animate-pulse'}`} />
            {isProcessing ? 'Generating background...' : 'Generate & Apply'}
          </span>
          {isProcessing && etaText && (
            <span className="text-xs font-normal opacity-80">
              {etaText}
            </span>
          )}
        </span>

        {!isProcessing && prompt.trim() && (
          <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  )
}
