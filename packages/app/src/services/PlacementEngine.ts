export interface AppPlacement {
  id: string
  name: string
  description: string
  category: 'upload' | 'dashboard' | 'minting' | 'marketplace'
  revenue_potential: number
  user_segment: 'all' | 'premium' | 'new_users' | 'power_users'
}

export class PlacementEngine {
  // App-specific placements (no overlap with extension)
  static readonly APP_PLACEMENTS: Record<string, AppPlacement> = {
    'upload_start': {
      id: 'upload_start',
      name: 'Upload Page Entry',
      description: 'Show campaign when user starts upload process',
      category: 'upload',
      revenue_potential: 3.50,
      user_segment: 'all'
    },
    'file_validation': {
      id: 'file_validation',
      name: 'After File Validation',
      description: 'Display after successful file validation',
      category: 'upload',
      revenue_potential: 2.75,
      user_segment: 'all'
    },
    'professional_services': {
      id: 'professional_services',
      name: 'Professional Services Upsell',
      description: 'Promote professional audio services',
      category: 'upload',
      revenue_potential: 15.00,
      user_segment: 'premium'
    },
    'gasless_mint_offer': {
      id: 'gasless_mint_offer',
      name: 'Gasless Minting Upsell',
      description: 'Offer gasless minting during NFT creation',
      category: 'minting',
      revenue_potential: 5.00,
      user_segment: 'all'
    },
    'dashboard_sidebar': {
      id: 'dashboard_sidebar',
      name: 'Dashboard Sidebar',
      description: 'Persistent sidebar placement in dashboard',
      category: 'dashboard',
      revenue_potential: 1.25,
      user_segment: 'all'
    },
    'mint_success': {
      id: 'mint_success',
      name: 'After Successful Mint',
      description: 'Show after successful NFT minting',
      category: 'minting',
      revenue_potential: 4.00,
      user_segment: 'all'
    },
    'marketplace_listing': {
      id: 'marketplace_listing',
      name: 'Marketplace Listing Prompt',
      description: 'Encourage marketplace listing after mint',
      category: 'marketplace',
      revenue_potential: 2.50,
      user_segment: 'all'
    }
  }

  static getPlacement(placementId: string): AppPlacement | null {
    return this.APP_PLACEMENTS[placementId] || null
  }

  static getPlacementsByCategory(category: AppPlacement['category']): AppPlacement[] {
    return Object.values(this.APP_PLACEMENTS).filter(p => p.category === category)
  }

  static getPlacementsByUserSegment(segment: AppPlacement['user_segment']): AppPlacement[] {
    return Object.values(this.APP_PLACEMENTS).filter(p => p.user_segment === segment || p.user_segment === 'all')
  }

  static calculateRevenuePotential(placementId: string, impressions: number): number {
    const placement = this.getPlacement(placementId)
    if (!placement) return 0
    
    // Simple revenue calculation: base potential * impression factor
    const impressionFactor = Math.min(impressions / 1000, 1) // Cap at 1000 impressions
    return placement.revenue_potential * impressionFactor
  }

  static validatePlacement(placementId: string): boolean {
    return placementId in this.APP_PLACEMENTS
  }
}