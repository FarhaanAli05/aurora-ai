'use client'

import { useRef, useState } from 'react'

interface ImageUploadProps {
  onImageUpload: (image: string) => void
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="card p-8">
      <div
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${
            dragActive
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-[#2d3239] hover:border-primary-500/50 hover:bg-[#252932]'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-5xl mb-4 opacity-60">📷</div>
        <h3 className="text-xl font-semibold text-[#e5e7eb] mb-2">
          Upload an image
        </h3>
        <p className="text-[#9ca3af] mb-1">
          Drag and drop an image here, or click to browse
        </p>
        <p className="text-sm text-[#6b7280]">Supports JPG, PNG, WEBP</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  )
}

