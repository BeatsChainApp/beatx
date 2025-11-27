const fs = require('fs');
const path = require('path');

class IpfsPinner {
  constructor(web3Token) {
    this.token = web3Token || null;
    this.isEnabled = !!this.token;
    if (this.isEnabled) {
      try {
        const { Web3Storage, File } = require('web3.storage');
        this.Web3Storage = Web3Storage;
        this.File = File;
        this.client = new Web3Storage({ token: this.token });
      } catch (e) {
        console.warn('web3.storage not available - pinning disabled in scaffold');
        this.isEnabled = false;
      }
    }
  }

  async pinJSON(obj) {
    if (!this.isEnabled) {
      return { ipfsHash: 'QmDevMock' + Math.random().toString(16).slice(2, 12) };
    }
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const file = new this.File([blob], 'metadata.json');
    const cid = await this.client.put([file], { wrapWithDirectory: false });
    return { ipfsHash: cid };
  }

  async pinFile(filePath, originalName) {
    if (!this.isEnabled) {
      return { ipfsHash: 'QmDevMock' + Math.random().toString(16).slice(2, 8) };
    }
    const buffer = fs.readFileSync(filePath);
    const file = new this.File([buffer], originalName || path.basename(filePath));
    const cid = await this.client.put([file], { wrapWithDirectory: false });
    return { ipfsHash: cid };
  }
}

module.exports = IpfsPinner;
