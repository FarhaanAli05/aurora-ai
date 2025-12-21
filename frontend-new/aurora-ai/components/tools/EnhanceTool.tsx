'use client'

import { useState } from 'react'

interface EnhanceToolProps {
  uploadedImage: string
  isProcessing: boolean
  onProcessingStart: () => void
  onProcessingComplete: (result: string) => void
  onProcessingError: (error: Error) => void
}

export default function EnhanceTool({
  uploadedImage,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
}: EnhanceToolProps) {
  const [quality, setQuality] = useState<'fast' | 'hq'>('fast')

  const handleProcess = async () => {
    onProcessingStart()
    setTimeout(() => {
      onProcessingComplete(uploadedImage)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <img
          src={uploadedImage}
          alt="Uploaded"
          className="w-full h-auto rounded-lg"
        />
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#e5e7eb] mb-3">
            Enhancement Quality
          </label>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border border-[#2d3239] rounded-lg cursor-pointer hover:border-primary-500/50 hover:bg-[#252932] transition-colors">
              <input
                type="radio"
                name="quality"
                value="fast"
                checked={quality === 'fast'}
                onChange={(e) => setQuality(e.target.value as 'fast' | 'hq')}
                className="mt-1 accent-primary-600"
              />
              <div className="flex-1">
                <div className="font-medium text-[#e5e7eb]">Fast (2×)</div>
                <div className="text-sm text-[#9ca3af] mt-1">
                  Quick enhancement with balanced quality
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 border border-[#2d3239] rounded-lg cursor-pointer hover:border-primary-500/50 hover:bg-[#252932] transition-colors">
              <input
                type="radio"
                name="quality"
                value="hq"
                checked={quality === 'hq'}
                onChange={(e) => setQuality(e.target.value as 'fast' | 'hq')}
                className="mt-1 accent-primary-600"
              />
              <div className="flex-1">
                <div className="font-medium text-[#e5e7eb]">High Quality (4×)</div>
                <div className="text-sm text-[#9ca3af] mt-1">
                  Maximum detail, takes longer to process
                </div>
              </div>
            </label>
          </div>
        </div>

        <button
          className="btn btn-primary w-full py-3 text-base font-semibold"
          onClick={handleProcess}
          disabled={isProcessing}
        >
          {isProcessing ? 'Enhancing...' : 'Enhance Image'}
        </button>

        {isProcessing && (
          <div className="flex flex-col items-center gap-3 p-6 bg-[#181b23] rounded-lg border border-[#2d3239]">
            <div className="w-8 h-8 border-2 border-[#2d3239] border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm text-[#9ca3af]">This may take a moment...</p>
          </div>
        )}
      </div>
    </div>
  )
}

