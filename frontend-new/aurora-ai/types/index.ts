export interface Tool {
  id: string
  title: string
  description: string
  thumbnail: string
  icon: string
  experimental?: boolean
}

export type ToolId = 'enhance' | 'remove-bg' | 'replace-bg' | 'generate-bg'

