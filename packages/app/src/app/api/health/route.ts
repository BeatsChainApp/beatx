import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'beatx-frontend',
    mcp_server: process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app',
    timestamp: Date.now() 
  })
}