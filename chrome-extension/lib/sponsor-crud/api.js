// API integration for Extension CRUD
class SponsorAPI {
  baseUrl;
  
  constructor(baseUrl) {
    const defaultUrl = (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_MCP_SERVER_URL || process.env.MCP_SERVER_URL)) ||
      (typeof window !== 'undefined' && window.__MCP_SERVER_URL__) ||
      'http://localhost:4000';
    this.baseUrl = baseUrl || defaultUrl;
  }
  
  async createSponsor(sponsor) {
    const response = await fetch(`${this.baseUrl}/api/sponsors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body.stringify(sponsor)
    });
    return response.json();
  }
  
  async getSponsors(filters?) {
    const params = new URLSearchParams(filters || {});
    const response = await fetch(`${this.baseUrl}/api/sponsors?${params}`);
    return response.json();
  }
  
  async updateSponsor(id, updates) {
    const response = await fetch(`${this.baseUrl}/api/sponsors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body.stringify(updates)
    });
    return response.json();
  }
  
  async deleteSponsor(id) {
    const response = await fetch(`${this.baseUrl}/api/sponsors/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}