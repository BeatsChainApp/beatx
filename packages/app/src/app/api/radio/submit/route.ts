import { NextRequest, NextResponse } from 'next/server'

interface RadioSubmissionData {
  title: string
  artist: string
  genre?: string
  language?: string
  userId?: string
  audioFile?: File
}

export async function POST(request: NextRequest) {
  try {
    const data: RadioSubmissionData = await request.json()
    
    // Basic validation
    if (!data.title || !data.artist) {
      return NextResponse.json(
        { error: 'Title and artist are required' },
        { status: 400 }
      )
    }

    // Create submission record (simplified)
    const submission = {
      id: `radio_${Date.now()}`,
      ...data,
      status: 'draft',
      step: 0,
      createdAt: new Date().toISOString()
    }

    // Trigger N8N workflow for upload complete
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
    if (n8nUrl) {
      try {
        await fetch(`${n8nUrl}/webhook/enhanced-radio-placement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placement_type: 'upload_complete',
            user_id: data.userId,
            submission_id: submission.id,
            timestamp: new Date().toISOString()
          })
        })
      } catch (error) {
        console.warn('N8N trigger failed:', error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      submission 
    })
  } catch (error) {
    console.error('Radio submission error:', error)
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    )
  }
}