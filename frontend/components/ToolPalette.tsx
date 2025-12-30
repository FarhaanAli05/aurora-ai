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
    <aside className="relative w-80 shrink-0 border-r border-white/10 bg-[#0c1118] flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
      <div className="relative px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white tracking-tight">AI Tools</h2>
          <span className="text-xs text-white/50">{tools.length} tools</span>
        </div>
        <p className="text-sm text-white/60 mt-2 leading-relaxed">
          Select a tool to transform your image
        </p>
      </div>

      <div className="relative flex-1 overflow-y-auto p-5 space-y-4 bg-[#0c1118]/60 backdrop-blur-xl">
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
