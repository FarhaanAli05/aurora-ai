'use client'

import { Tool } from '@/types'

interface ToolCardProps {
  tool: Tool
  isSelected: boolean
  onSelect: () => void
}

export default function ToolCard({ tool, isSelected, onSelect }: ToolCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        w-full text-left transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-primary-600 bg-primary-50 shadow-md' 
          : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-primary-300 hover:shadow-sm'
        }
        rounded-xl overflow-hidden
      `}
      type="button"
    >
      <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{tool.icon}</span>
        </div>
        {/* Thumbnail image - will be used when images are added */}
        {/* <Image
          src={tool.thumbnail}
          alt={tool.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
        /> */}
        {tool.experimental && (
          <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide">
            Experimental
          </span>
        )}
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-gray-900">{tool.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {tool.description}
        </p>
      </div>
    </button>
  )
}

