'use client'

import { useState, useRef } from 'react'
import GenerateBgTool from './GenerateBgTool'

interface ReplaceBgToolProps {
  uploadedImage: string
  hasTransparentBg: boolean
  isProcessing: boolean
  onProcessingStart: () => void
  onProcessingComplete: (result: string) => void
  onProcessingError: (error: Error) => void
}

export default function ReplaceBgTool({
  uploadedImage,
  hasTransparentBg,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
}: ReplaceBgToolProps) {
  const [bgType, setBgType] = useState<'upload' | 'generate'>('upload')
  const [bgImage, setBgImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setBgImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleProcess = async () => {
    if (bgType === 'upload' && !bgImage) {
      alert('Please upload a background image')
      return
    }

    onProcessingStart()
    setTimeout(() => {
      onProcessingComplete(uploadedImage)
    }, 2000)
  }

  if (!hasTransparentBg) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="w-full h-auto rounded-lg"
          />
        </div>

        <div className="card p-6">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-amber-900 mb-1">
                Background removal required
              </p>
              <p className="text-sm text-amber-800">
                Please remove the background first, or upload an image with a
                transparent background to use this tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Background Source
          </label>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="bg_type"
                value="upload"
                checked={bgType === 'upload'}
                onChange={(e) => setBgType(e.target.value as 'upload' | 'generate')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Upload Image</div>
                <div className="text-sm text-gray-600 mt-1">
                  Use your own background image
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="bg_type"
                value="generate"
                checked={bgType === 'generate'}
                onChange={(e) => setBgType(e.target.value as 'upload' | 'generate')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Generate with AI
                  <span className="ml-2 text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded uppercase font-semibold">
                    Experimental
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Create a background from a text prompt
                </div>
              </div>
            </label>
          </div>
        </div>

        {bgType === 'upload' && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Background Image
            </label>
            <button
              className="btn btn-secondary mb-3"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Background Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBgUpload}
              className="hidden"
            />
            {bgImage && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                <img src={bgImage} alt="Background preview" className="w-full h-auto" />
              </div>
            )}
          </div>
        )}

        {bgType === 'generate' && (
          <GenerateBgTool
            onProcessingStart={onProcessingStart}
            onProcessingComplete={onProcessingComplete}
            onProcessingError={onProcessingError}
            isProcessing={isProcessing}
          />
        )}

        <button
          className="btn btn-primary w-full py-3 text-base font-semibold"
          onClick={handleProcess}
          disabled={isProcessing || (bgType === 'upload' && !bgImage)}
        >
          {isProcessing ? 'Processing...' : 'Replace Background'}
        </button>

        {isProcessing && (
          <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Compositing your image...</p>
          </div>
        )}
      </div>
    </div>
  )
}

