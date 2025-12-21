export async function hasTransparency(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      const step = Math.max(1, Math.floor(data.length / 40000))
      for (let i = 3; i < data.length; i += step * 4) {
        if (data[i] < 255) {
          resolve(true)
          return
        }
      }
      resolve(false)
    }
    img.onerror = () => resolve(false)
    img.src = imageUrl
  })
}

export async function compositeImages(
  foregroundUrl: string,
  backgroundUrl: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const foregroundImg = new Image()
    const backgroundImg = new Image()
    
    if (foregroundUrl.startsWith('http://') || foregroundUrl.startsWith('https://')) {
      foregroundImg.crossOrigin = 'anonymous'
    }
    if (backgroundUrl.startsWith('http://') || backgroundUrl.startsWith('https://')) {
      backgroundImg.crossOrigin = 'anonymous'
    }
    
    let foregroundLoaded = false
    let backgroundLoaded = false
    
    const tryComposite = () => {
      if (!foregroundLoaded || !backgroundLoaded) return
      
      const canvas = document.createElement('canvas')
      canvas.width = foregroundImg.width
      canvas.height = foregroundImg.height
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)
      
      ctx.drawImage(foregroundImg, 0, 0)
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create composite image'))
          return
        }
        const url = URL.createObjectURL(blob)
        resolve(url)
      }, 'image/png')
    }
    
    foregroundImg.onload = () => {
      foregroundLoaded = true
      tryComposite()
    }
    
    backgroundImg.onload = () => {
      backgroundLoaded = true
      tryComposite()
    }
    
    foregroundImg.onerror = () => reject(new Error('Failed to load foreground image'))
    backgroundImg.onerror = () => reject(new Error('Failed to load background image'))
    
    foregroundImg.src = foregroundUrl
    backgroundImg.src = backgroundUrl
  })
}

