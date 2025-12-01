import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { trackTitle, artistName, userId } = await request.json()

    if (!trackTitle || !artistName) {
      return NextResponse.json(
        { error: 'Track title and artist name are required' },
        { status: 400 }
      )
    }

    // Generate ISRC via MCP server
    const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL
    if (!mcpUrl) {
      return NextResponse.json(
        { error: 'MCP server not configured' },
        { status: 500 }
      )
    }

    const mcpResponse = await fetch(`${mcpUrl}/api/isrc/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackTitle,
        artistName,
        userId,
        territory: 'ZA',
        registrant: '80G'
      })
    })

    if (!mcpResponse.ok) {
      throw new Error('ISRC generation failed')
    }

    const isrcResult = await mcpResponse.json()

    // Trigger revenue tracking for ISRC generation
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
    if (n8nUrl) {
      try {
        await fetch(`${n8nUrl}/webhook/enhanced-radio-placement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placement_type: 'isrc_complete',
            user_id: userId,
            isrc_generated: true,
            isrc: isrcResult.isrc,
            timestamp: new Date().toISOString()
          })
        })
      } catch (error) {
        console.warn('N8N trigger failed:', error)
      }
    }

    return NextResponse.json(isrcResult)
  } catch (error) {
    console.error('ISRC generation error:', error)
    return NextResponse.json(
      { error: 'ISRC generation failed' },
      { status: 500 }
    )
  }
}