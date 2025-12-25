'use client'

import { useState, useRef, useEffect } from 'react'
import { processImage } from '@/lib/api'
import { hasTransparency, compositeImages } from '@/lib/imageUtils'
import { ImagePlus, Sparkles, Upload } from 'lucide-react'
import GenerateBgTool from './GenerateBgTool'

interface ReplaceBgToolProps {
  uploadedImage: string
  isProcessing: boolean
  onProcessingStart: () => void
  onProcessingComplete: (result: string) => void
  onProcessingError: (error: Error | string) => void
  initialBgType?: 'upload' | 'generate'
  disabled?: boolean
}

export default function ReplaceBgTool({
  uploadedImage,
  isProcessing,
  onProcessingStart,
  onProcessingComplete,
  onProcessingError,
  initialBgType = 'upload',
  disabled = false,
}: ReplaceBgToolProps) {
  const [bgType, setBgType] = useState<'upload' | 'generate'>(initialBgType)
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [imageHasTransparency, setImageHasTransparency] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setBgType(initialBgType)
  }, [initialBgType])

  useEffect(() => {
    let cancelled = false

    if (!uploadedImage) return

    hasTransparency(uploadedImage)
      .then((result) => !cancelled && setImageHasTransparency(result))
      .catch(() => !cancelled && setImageHasTransparency(false))

    return () => {
      cancelled = true
    }
  }, [uploadedImage])

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const reader = new FileReader()
    reader.onload = (ev) => setBgImage(ev.target?.result as string)
    reader.readAsDataURL(e.target.files[0])
  }

  const handleProcess = async () => {
    if (!bgImage) {
      onProcessingError('Please upload a background image')
      return
    }

    onProcessingStart()

    try {
      if (imageHasTransparency) {
        const compositeUrl = await compositeImages(uploadedImage, bgImage)
        onProcessingComplete(compositeUrl)
        return
      }

      const fgBlob = await (await fetch(uploadedImage)).blob()
      const bgBlob = await (await fetch(bgImage)).blob()

      const resultBlob = await processImage(
        new File([fgBlob], 'image.jpg'),
        {
          mode: 'remove_background',
          bgType: 'upload',
          backgroundFile: new File([bgBlob], 'background.jpg'),
        }
      )

      onProcessingComplete(URL.createObjectURL(resultBlob))
    } catch (err) {
      onProcessingError('Failed to replace background. Please try again.')
    }
  }


  if (imageHasTransparency === null) {
    return (
      <div className="card p-4 flex items-center gap-2 text-sm text-[#9ca3af]">
        <div className="w-4 h-4 border-2 border-[#2d3239] border-t-primary-600 rounded-full animate-spin" />
        Checking image transparency…
      </div>
    )
  }

  if (imageHasTransparency === false) {
    return (
      <div className="card p-4">
        <p className="text-sm text-amber-400 font-medium mb-1">
          Background removal required
        </p>
        <p className="text-xs text-[#9ca3af]">
          Remove the background first, or upload an image with transparency.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-6 animate-in">
      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-600/15 text-primary-400 flex items-center justify-center">
            <ImagePlus className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight">
              Replace Background
            </h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              Seamlessly place your subject into a new environment - upload your own
              background or generate one with AI.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setBgType('upload')}
            disabled={isProcessing || disabled}
            className={`
              rounded-xl border p-4 text-left transition-all
              ${bgType === 'upload'
                ? 'border-primary-500 bg-primary-600/10'
                : 'border-[#2d3239] hover:border-primary-500/40 hover:bg-[#252932]'
              }
            `}
          >
            <div className="flex gap-3">
              <Upload className="w-5 h-5 text-primary-400" />
              <div>
                <p className="font-medium text-sm">Upload Background</p>
                <p className="text-xs text-[#9ca3af]">
                  Use your own image
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setBgType('generate')}
            disabled={isProcessing || disabled}
            className={`
              rounded-xl border p-4 text-left transition-all
              ${bgType === 'generate'
                ? 'border-primary-500 bg-primary-600/10'
                : 'border-[#2d3239] hover:border-primary-500/40 hover:bg-[#252932]'
              }
            `}
          >
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <div>
                <p className="font-medium text-sm">
                  Generate with AI
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                    Experimental
                  </span>
                </p>
                <p className="text-xs text-[#9ca3af]">
                  Describe a scene in text
                </p>
              </div>
            </div>
          </button>
        </div>

        {bgType === 'upload' && (
          <>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary text-sm"
                disabled={isProcessing || disabled}
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
            </div>

            {bgImage && (
              <div className="rounded-lg overflow-hidden border border-[#2d3239] max-w-xs">
                <img src={bgImage} alt="Background preview" />
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={isProcessing || disabled || !bgImage}
              className={`
                relative w-full rounded-xl px-6 py-3.5 font-semibold text-sm
                transition-all
                ${isProcessing || !bgImage
                  ? 'bg-[#2d3239] text-[#6b7280] cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400'
                }
              `}
            >
              {isProcessing ? 'Processing…' : 'Replace Background'}
            </button>
          </>
        )}

        {bgType === 'generate' && (
          <GenerateBgTool
            uploadedImage={uploadedImage}
            isProcessing={isProcessing}
            onProcessingStart={onProcessingStart}
            onProcessingComplete={onProcessingComplete}
            onProcessingError={onProcessingError}
            disabled={disabled}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        {[
          { title: 'Seamless Compositing', desc: 'Natural lighting & edges' },
          { title: 'Upload or Generate', desc: 'Full creative control' },
          { title: 'Studio-Ready', desc: 'Perfect for marketing & design' },
        ].map((item) => (
          <div key={item.title} className="card p-4 text-center space-y-1">
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-[#9ca3af]">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
