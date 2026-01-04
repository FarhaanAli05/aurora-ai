import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 600

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const backendResponse = await fetch(`${BACKEND_URL}/process`, {
      method: 'POST',
      body: formData,
    })

    const headers = new Headers()
    backendResponse.headers.forEach((value, key) => {
      headers.set(key, value)
    })

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: headers,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { status: 500 }
    )
  }
}

