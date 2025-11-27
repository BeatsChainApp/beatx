#!/usr/bin/env node
require('dotenv').config();
const Thirdweb = require('../src/services/thirdwebAdapter');

async function main(){
  console.log('Starting thirdweb pending mints processor...')
  try{
    const res = await Thirdweb.processPendingQueue({ limit: 50 })
    console.log('Process result:', JSON.stringify(res, null, 2))
  }catch(err){
    console.error('Processor error', err && err.message)
    process.exit(2)
  }
}

main()
