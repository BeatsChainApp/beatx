const fs = require('fs')
const path = require('path')
const Jobs = require('../src/services/thirdwebJobs')

const DATA_DIR = path.join(__dirname, '..', 'src', 'data')
const STORE = path.join(DATA_DIR, 'pending_mints.json')

beforeEach(()=>{
  try{ if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }) }catch(e){}
  fs.writeFileSync(STORE, JSON.stringify([], null, 2))
})

afterEach(()=>{
  try{ fs.unlinkSync(STORE) }catch(e){}
})

test('enqueue and list file fallback', async ()=>{
  const job = { id: 'job-1', createdAt: new Date().toISOString(), to: '0xabc', metadata: { foo: 'bar' }, clientId: 'c1' }
  await Jobs.enqueue(job)
  const pending = await Jobs.listPending()
  expect(Array.isArray(pending)).toBe(true)
  expect(pending.length).toBe(1)
  expect(pending[0].id).toBe('job-1')
})

test('claimJobs file fallback dequeues items', async ()=>{
  const job1 = { id: 'job-1', createdAt: new Date().toISOString(), to: '0x1', metadata: {}, clientId: 'c1' }
  const job2 = { id: 'job-2', createdAt: new Date().toISOString(), to: '0x2', metadata: {}, clientId: 'c1' }
  await Jobs.enqueue(job1)
  await Jobs.enqueue(job2)
  const claimed = await Jobs.claimJobs('worker-x', 1)
  expect(claimed.length).toBe(1)
  const remaining = await Jobs.listPending()
  expect(remaining.length).toBe(1)
})
