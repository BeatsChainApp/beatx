import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://beatschain-mcp-server-production.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contributors, signatureMode, trackData } = body;

    const response = await fetch(`${MCP_SERVER_URL}/api/signatures/radio-process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contributors, trackData, signatureMode })
    });

    const result = await response.json();

    if (result.success) {
      await fetch(`${MCP_SERVER_URL}/api/campaigns/track-revenue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'signature_service',
          amount: signatureMode === 'docusign' ? 7.50 : 4.50,
          metadata: { signatureMode, contributorCount: contributors.length }
        })
      }).catch(console.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Processing failed' }, { status: 500 });
  }
}