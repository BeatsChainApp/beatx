const { ethers } = require('ethers');

class CustomRelayer {
  constructor() {
    this.adminWallet = new ethers.Wallet(
      process.env.RELAYER_ADMIN_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
    );
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  }

  async executeTransaction(jobData) {
    try {
      const tx = await this.adminWallet.sendTransaction({
        to: jobData.to || this.contractAddress,
        data: jobData.data,
        gasLimit: jobData.gasLimit || 500000,
        gasPrice: await this.getOptimalGasPrice()
      });
      
      return await tx.wait();
    } catch (error) {
      throw new Error(`Relayer execution failed: ${error.message}`);
    }
  }

  async getOptimalGasPrice() {
    const gasPrice = await this.adminWallet.provider.getGasPrice();
    return gasPrice.mul(110).div(100); // 10% buffer
  }

  async getBalance() {
    return await this.adminWallet.getBalance();
  }
}

module.exports = CustomRelayer;