// API integration for Extension CRUD
export class SponsorAPI {
  private baseUrl: string;

  // Use environment config when available. Falls back to localhost for local dev.
  constructor(baseUrl = (process.env.NEXT_PUBLIC_MCP_SERVER_URL || process.env.MCP_SERVER_URL || 'http://localhost:4000')) {
    this.baseUrl = baseUrl;
  }
  
  async createSponsor(sponsor: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/sponsors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sponsor)
    });
    return response.json();
  }
  
  async getSponsors(filters?: any): Promise<any> {
    const params = new URLSearchParams(filters || {});
    const response = await fetch(`${this.baseUrl}/api/sponsors?${params}`);
    return response.json();
  }
  
  async updateSponsor(id: string, updates: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/sponsors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }
  
  async deleteSponsor(id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/sponsors/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}