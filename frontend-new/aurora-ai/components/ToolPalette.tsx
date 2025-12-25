'use client'

import { Tool } from '@/types'
import ToolCard from './ToolCard'

interface ToolPaletteProps {
  tools: Tool[]
  selectedTool: string | null
  onToolSelect: (toolId: string) => void
}

export default function ToolPalette({
  tools,
  selectedTool,
  onToolSelect,
}: ToolPaletteProps) {
  return (
    <aside className="
      relative w-80 shrink-0
      bg-[#0f1115]
      border-r border-white/5
      flex flex-col
      overflow-hidden
    ">
      {/* <div className="pointer-events-none absolute inset-y-0 -right-24 w-64">
        <div className="
          h-full w-full
          bg-gradient-to-r
          from-primary-500/10
          via-blue-500/5
          to-transparent
          blur-2xl
        " />
      </div> */}
      <div className="px-6 py-5 border-b border-white/5">
        <h2 className="text-base font-semibold text-[#e5e7eb] tracking-tight">
          AI Tools
        </h2>
        <p className="text-sm text-[#9ca3af] mt-1 leading-relaxed">
          Choose a tool to transform your image
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#181b23]">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isSelected={selectedTool === tool.id}
            onSelect={() => onToolSelect(tool.id)}
          />
        ))}
      </div>
    </aside>
  )
}
