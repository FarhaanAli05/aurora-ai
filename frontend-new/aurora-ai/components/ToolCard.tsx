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
      type="button"
      className={`
        group relative w-full text-left
        rounded-xl overflow-hidden
        border transition-all duration-300
        ${isSelected
          ? 'border-primary-500/50 bg-primary-500/10'
          : 'border-white/5 bg-[#1a1d26] hover:border-primary-500/30'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isSelected && (
        <div className="
          absolute inset-0 -z-10
          bg-gradient-to-br from-primary-500/20 via-blue-500/10 to-fuchsia-500/20
          blur-xl
        " />
      )}

      <div className="relative aspect-video bg-[#0b0d12] overflow-hidden">
        <Image
          src={tool.thumbnail}
          alt={tool.title}
          fill
          className={`
            object-cover transition-transform duration-500
            ${!disabled && 'group-hover:scale-[1.04]'}
          `}
          sizes="320px"
        />

        <div className="
          absolute bottom-2 right-2
          w-8 h-8 rounded-lg
          bg-black/50 backdrop-blur
          border border-white/10
          flex items-center justify-center
        ">
          <Image
            src={tool.icon}
            alt=""
            width={18}
            height={18}
            className="opacity-90"
          />
        </div>

        {tool.experimental && (
          <span className="
            absolute top-2 left-2
            text-[10px] font-semibold uppercase tracking-wide
            px-2 py-1 rounded-md
            bg-amber-400/15 text-amber-300
            border border-amber-400/30
            backdrop-blur
          ">
            Experimental
          </span>
        )}

        {disabled && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {disabledReason && (
              <span className="text-xs text-white font-medium bg-black/60 px-3 py-2 rounded-lg">
                {disabledReason}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-4 space-y-1">
        <h3 className="text-sm font-semibold text-[#e5e7eb]">
          {tool.title}
        </h3>
        <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>
    </button>
  )
}
