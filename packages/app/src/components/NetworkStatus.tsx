'use client'

import React from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { GetNetworkColor } from '@/utils/network'
import { LinkComponent } from './LinkComponent'

export function NetworkStatus() {
  const account = useActiveAccount()
  const chain = account?.chain
  // TODO: Implement block number with Thirdweb
  const block = { data: 0n }
  const explorerUrl = chain?.blockExplorers?.default.url
  const networkName = chain?.name ?? 'Ethereum'
  const color = GetNetworkColor(networkName, 'bgVariant')

  return (
    <div className='flex items-center gap-2 p-4'>
      <div className={`badge badge-info ${color}`}>{networkName}</div>
      {explorerUrl && (
        <LinkComponent href={explorerUrl}>
          <p className='text-xs'># {block.data?.toString()}</p>
        </LinkComponent>
      )}
      {!explorerUrl && <p className='text-xs'># {block.data?.toString()}</p>}
    </div>
  )
}
