'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Sparkles } from 'lucide-react'

interface EmptyUploadStateProps {
  onImageUpload: (image: string) => void
}

export default function EmptyUploadState({
  onImageUpload,
}: EmptyUploadStateProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center justify-center min-h-[420px] px-4">
      <div className="w-full max-w-xl">
        <div
          className={`
            relative rounded-3xl border-2 border-dashed
            p-10 md:p-12 text-center transition-all duration-300
            ${
              dragActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-white/10 hover:border-primary-500/40 hover:bg-white/5'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragActive(false)
            if (e.dataTransfer.files?.[0]) {
              handleFile(e.dataTransfer.files[0])
            }
          }}
        >
          {/* <img
            src="/icons/aurora-logo-3.png"
            alt=""
            className="w-14 h-14 mx-auto mb-6 rounded-xl grayscale brightness-[200%] opacity-90"
          /> */}

          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-primary-500/15 text-primary-400 flex items-center justify-center">
            <ImagePlus className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-semibold text-[#e5e7eb] tracking-tight mb-2">
            Upload an image to begin
          </h2>

          <p className="text-sm text-[#9ca3af] max-w-sm mx-auto leading-relaxed mb-6">
            Remove backgrounds, enhance quality, or generate new scenes with
            Aurora&apos;s AI-powered image tools.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-primary-600 to-primary-500
            hover:from-primary-500 hover:to-primary-400
            transition-all
          ">
            <Sparkles className="w-4 h-4" />
            Upload image
          </div>

          <p className="mt-4 text-xs text-[#6b7280]">
            Drag & drop or click - JPG, PNG, WEBP - up to 10MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFile(e.target.files[0])
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
