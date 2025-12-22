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
          ? 'ring-2 ring-primary-600 shadow-lg' 
          : 'hover:shadow-md'
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        rounded-lg overflow-hidden bg-[#1f2330] border border-[#2d3239]
      `}
      type="button"
    >
      <div className="relative aspect-video overflow-hidden bg-[#181b23]">
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
        
        <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#1f2330] rounded-md border border-[#2d3239] flex items-center justify-center z-10 shadow-lg">
          <Image
            src={tool.icon}
            alt=""
            width={20}
            height={20}
            className="opacity-90"
          />
        </div>
        
        {tool.experimental && (
          <span className="absolute top-2 right-2 bg-amber-500/20 backdrop-blur-sm text-amber-400 text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wide border border-amber-500/30 z-20">
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
      
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-sm text-[#e5e7eb] leading-tight">
          {tool.title}
        </h3>
        <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>
    </button>
  )
}

