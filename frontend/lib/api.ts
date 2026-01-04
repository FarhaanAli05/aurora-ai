const getApiBaseUrl = (mode: string, options?: ProcessImageOptions) => {
  return '/api'
}

const API_BASE_URL = '/api'

export type ProcessingMode =
  | 'remove_background'
  | 'enhance_2x'
  | 'enhance_4x'
  | 'advanced_2x'
  | 'advanced_4x'

export interface ProcessImageOptions {
  mode: ProcessingMode
  backgroundFile?: File
  bgType?: 'upload' | 'generate'
  bgPrompt?: string
  bgQuality?: 'fast' | 'hq'
  timeout?: number
  onNotice?: (message: string) => void
}

function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

function base64ToBlob(base64: string, mimeType: string = 'image/png'): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

function extractImageFromHtml(html: string): Blob {
  const dataUrlMatch = html.match(/data:image\/png;base64,([^"'\s<>]+)/i)
  if (dataUrlMatch) {
    const base64Data = dataUrlMatch[1]
    return base64ToBlob(base64Data, 'image/png')
  }

  const imgSrcMatch = html.match(/<img[^>]+src=["'](data:image\/[^"']+)["']/i)
  if (imgSrcMatch && imgSrcMatch[1].startsWith('data:')) {
    return dataURLtoBlob(imgSrcMatch[1])
  }

  throw new Error('Could not extract image from server response')
}

async function extractErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || ''
  let errorMessage = 'Failed to process image'

  if (contentType.includes('text/html')) {
    const html = await response.text()
    const errorMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i)
    if (errorMatch) {
      errorMessage = errorMatch[1].trim()
    }
  } else {
    try {
      const json = await response.json()
      errorMessage = json.detail || json.message || errorMessage
    } catch {
    }
  }

  return errorMessage
}

function getDefaultTimeout(mode: ProcessingMode, bgType?: 'upload' | 'generate'): number {
  if (bgType === 'generate') {
    return 180000
  }
  
  if (mode === 'enhance_4x' || mode === 'advanced_4x') {
    return 300000
  }
  
  if (mode === 'enhance_2x' || mode === 'advanced_2x') {
    return 120000
  }
  
  return 60000
}

export async function processImage(
  imageFile: File,
  options: ProcessImageOptions
): Promise<Blob> {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('mode', options.mode)

  if (options.backgroundFile) {
    formData.append('background', options.backgroundFile)
    formData.append('bg_type', options.bgType || 'upload')
  } else if (options.bgType === 'generate' && options.bgPrompt) {
    formData.append('bg_type', 'generate')
    formData.append('bg_prompt', options.bgPrompt)
    formData.append('bg_quality', options.bgQuality || 'fast')
  }

  const timeout = options.timeout ?? getDefaultTimeout(options.mode, options.bgType)
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  const apiBaseUrl = getApiBaseUrl(options.mode, options)
  const fetchUrl = `${apiBaseUrl}/process`

  try {
    const response = await fetch(fetchUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        'Accept': 'image/png, */*',
      },
    })

    clearTimeout(timeoutId)

    const contentType = response.headers.get('content-type') || ''
    const notice = response.headers.get('x-aurora-notice')
    if (notice && options.onNotice) {
      options.onNotice(notice)
    }

    if (!response.ok) {
      const errorMessage = await extractErrorMessage(response)
      throw new Error(errorMessage)
    }

    if (contentType.includes('image/png')) {
      return await response.blob()
    }

    const html = await response.text()
    return extractImageFromHtml(html)
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        if (options.mode === 'enhance_4x' || options.mode === 'advanced_4x') {
          throw new Error(
            'Enhancement timed out. 4x upscaling on CPU can take several minutes for large images. ' +
            'Please try with a smaller image or use 2x enhancement for faster processing.'
          )
        }
        if (options.mode === 'enhance_2x' || options.mode === 'advanced_2x') {
          throw new Error(
            'Enhancement timed out. Please try again or use a smaller image.'
          )
        }
        if (options.bgType === 'generate') {
          throw new Error(
            'Background generation timed out. The GPU queue may be busy. Please try again in a moment.'
          )
        }
        throw new Error('Request timed out. Please try again.')
      }
      if (error.message.includes('fetch')) {
        throw new Error('Unable to reach the server. Please check your connection.')
      }
      throw error
    }
    throw new Error('An unexpected error occurred')
  }
}

export async function removeBackground(imageFile: File): Promise<Blob> {
  return processImage(imageFile, { mode: 'remove_background' })
}

export async function enhanceImage(
  imageFile: File,
  scale: 2 | 4 = 4
): Promise<Blob> {
  const mode = scale === 2 ? 'enhance_2x' : 'enhance_4x'
  return processImage(imageFile, { mode })
}

export async function replaceBackground(
  imageFile: File,
  backgroundFile: File
): Promise<Blob> {
  return processImage(imageFile, {
    mode: 'remove_background',
    backgroundFile,
    bgType: 'upload',
  })
}

export async function generateBackground(
  imageFile: File,
  prompt: string,
  quality: 'fast' | 'hq' = 'fast'
): Promise<Blob> {
  return processImage(imageFile, {
    mode: 'remove_background',
    bgType: 'generate',
    bgPrompt: prompt,
    bgQuality: quality,
  })
}
