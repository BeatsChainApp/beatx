export class N8NRadioIntegration {
  private webhookUrl: string

  constructor() {
    this.webhookUrl = `${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''}/webhook/enhanced-radio-placement`
  }

  async triggerPlacement(placement: string, context: any) {
    const payload = {
      placement_type: placement,
      user_id: context.userId,
      timestamp: new Date().toISOString(),
      ...context
    }

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.warn('N8N trigger failed:', error)
    }
  }

  async triggerRadioSubmissionEvent(event: string, data: any) {
    await this.triggerPlacement(event, {
      ...data,
      flow_type: 'enhanced_radio',
      platform: 'app'
    })
  }
}