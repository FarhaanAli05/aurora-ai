const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

export async function removeBackground(
  imageFile: File
): Promise<Blob> {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('mode', 'remove_background')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  try {
    const response = await fetch(`${API_BASE_URL}/process`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        // Don't set Content-Type for FormData - browser sets it automatically with boundary
      },
    })

    clearTimeout(timeoutId)

    const contentType = response.headers.get('content-type') || ''

    if (!response.ok) {
      let errorMessage = 'Failed to remove background'
      
      if (response.headers.get('content-type')?.includes('text/html')) {
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

      throw new Error(errorMessage)
    }

    if (contentType.includes('image/png')) {
      const blob = await response.blob()
      return blob
    } else {
      const html = await response.text()
      
      const dataUrlMatch = html.match(/data:image\/png;base64,([^"'\s<>]+)/i)
      if (dataUrlMatch) {
        const base64Data = dataUrlMatch[1]
        try {
          const blob = base64ToBlob(base64Data, 'image/png')
          return blob
        } catch (blobError) {
          throw blobError
        }
      }
      
      const imgSrcMatch = html.match(/<img[^>]+src=["'](data:image\/[^"']+)["']/i)
      if (imgSrcMatch && imgSrcMatch[1].startsWith('data:')) {
        try {
          const blob = dataURLtoBlob(imgSrcMatch[1])
          return blob
        } catch (blobError) {
          throw blobError
        }
      }
      
      throw new Error('Could not extract image from server response')
    }
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
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

