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
    <aside className="w-80 bg-[#181b23] border-r border-[#2d3239] flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2d3239] bg-[#0f1115]">
        <h2 className="text-lg font-semibold text-[#e5e7eb]">AI Tools</h2>
        <p className="text-sm text-[#9ca3af] mt-1">
          Select a tool to get started
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tools.map((tool) => {
          return (
            <ToolCard
              key={tool.id}
              tool={tool}
              isSelected={selectedTool === tool.id}
              onSelect={() => onToolSelect(tool.id)}
            />
          )
        })}
      </div>
    </aside>
  )
}

