import { NextRequest, NextResponse } from 'next/server'

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetch(`${MCP_SERVER_URL}/api/payments`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Payment failed', details: error.message },
      { status: 500 }
    )
  }
}