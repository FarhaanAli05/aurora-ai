'use client'

import Image from 'next/image'
import { Tool } from '@/types'

interface ToolCardProps {
  tool: Tool
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
  disabledReason?: string
}

export default function ToolCard({
  tool,
  isSelected,
  onSelect,
  disabled = false,
  disabledReason,
}: ToolCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        group relative w-full text-left transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-primary-600 shadow-lg scale-[1.02]' 
          : 'hover:shadow-md hover:scale-[1.01]'
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        rounded-xl overflow-hidden bg-white
      `}
      type="button"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-900">
        <Image
          src={tool.thumbnail}
          alt={tool.title}
          fill
          className={`object-cover transition-transform duration-300 ${
            !disabled && 'group-hover:scale-105'
          }`}
          sizes="(max-width: 768px) 100vw, 320px"
          priority={false}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white z-10">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-base leading-tight drop-shadow-lg">
              {tool.title}
            </h3>
            <p className="text-xs text-white/95 leading-relaxed line-clamp-2 drop-shadow-md">
              {tool.description}
            </p>
          </div>
        </div>
        
        {tool.experimental && (
          <span className="absolute top-2.5 right-2.5 bg-amber-500/95 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wide shadow-lg z-20">
            Experimental
          </span>
        )}
        
        {disabled && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-30">
            {disabledReason && (
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-xs text-white text-center font-medium">
                  {disabledReason}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

