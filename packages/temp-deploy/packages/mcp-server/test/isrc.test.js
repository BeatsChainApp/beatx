const { generateISRC } = require('../src/isrcManagerServer')

test('generateISRC returns valid format', async () => {
  const isrc = await generateISRC({ title: 'T', artist: 'A', userId: 'u-1' })
  expect(typeof isrc).toBe('string')
  expect(isrc).toMatch(/^ZA-80G-\d{2}-\d{5}$/)
})
