export interface RevenueEvent {
  placement_type: string
  revenue_amount: number
  timestamp: string
  platform: 'app'
  flow_type: 'radio_submission'
  user_id?: string
  context?: any
}

export class RadioRevenueTracker {
  private mcpUrl: string

  constructor() {
    this.mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || ''
  }

  async trackPlacementRevenue(placement: string, amount: number, context: any = {}) {
    const data: RevenueEvent = {
      placement_type: placement,
      revenue_amount: amount,
      timestamp: new Date().toISOString(),
      platform: 'app',
      flow_type: 'radio_submission',
      user_id: context.userId,
      context
    }

    try {
      await fetch(`${this.mcpUrl}/api/campaigns/track-revenue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.warn('Revenue tracking failed:', error)
    }
  }

  // Revenue amounts for each placement
  getPlacementRevenue(placement: string): number {
    const revenues = {
      'upload_complete': 2.50,
      'metadata_complete': 2.00,
      'splitsheet_complete': 3.50,
      'samro_complete': 4.00,
      'isrc_complete': 2.50,
      'package_ready': 5.00,
      'submission_success': 6.00
    }
    return revenues[placement as keyof typeof revenues] || 0
  }
}