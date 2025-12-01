const fs = require('fs');
const FormData = require('form-data');
const fetch = require('cross-fetch');

class PinataPinner {
  constructor(jwt) {
    this.jwt = jwt;
    this.isEnabled = !!jwt;
    this.baseUrl = 'https://api.pinata.cloud';
  }

  async pinJSON(obj) {
    if (!this.isEnabled) {
      return { 
        cid: 'QmMock' + Math.random().toString(16).slice(2, 12),
        url: 'https://gateway.pinata.cloud/ipfs/QmMock' + Math.random().toString(16).slice(2, 12)
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.jwt}`
        },
        body: JSON.stringify({
          pinataContent: obj,
          pinataMetadata: {
            name: 'metadata.json'
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Pinata API error');
      }

      return {
        cid: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      };
    } catch (error) {
      console.error('Pinata JSON pinning failed:', error);
      throw error;
    }
  }

  async pinFile(filePath, originalName) {
    if (!this.isEnabled) {
      return { 
        cid: 'QmMock' + Math.random().toString(16).slice(2, 8),
        url: 'https://gateway.pinata.cloud/ipfs/QmMock' + Math.random().toString(16).slice(2, 8)
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      
      const metadata = JSON.stringify({
        name: originalName || 'file'
      });
      formData.append('pinataMetadata', metadata);

      const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Pinata API error');
      }

      return {
        cid: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      };
    } catch (error) {
      console.error('Pinata file pinning failed:', error);
      throw error;
    }
  }
}

module.exports = PinataPinner;