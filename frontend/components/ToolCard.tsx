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
        rounded-2xl overflow-hidden
        border transition-all duration-300
        bg-gradient-to-br from-[#161c28] via-[#111621] to-[#0c1018]
        shadow-[0_18px_40px_rgba(6,10,18,0.45)]
        ${isSelected
          ? 'border-primary-400/50 ring-1 ring-primary-400/40'
          : 'border-white/10 hover:border-white/20 hover:shadow-[0_20px_48px_rgba(6,10,18,0.6)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isSelected && (
        <div className="
          absolute inset-0 -z-10
          bg-gradient-to-br from-primary-400/20 via-blue-400/10 to-indigo-500/15
          blur-xl
        " />
      )}

      <div className="relative aspect-[16/10] bg-[#0b0f16] overflow-hidden">
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="
          absolute top-2 right-2
          w-9 h-9 rounded-xl
          bg-black/60 backdrop-blur
          border border-white/15
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
        <h3 className="text-sm font-semibold text-white">
          {tool.title}
        </h3>
        <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>
    </button>
  )
}
