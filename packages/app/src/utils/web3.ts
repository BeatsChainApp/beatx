import { ETH_CHAINS } from './network'

export const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? ''
if (!THIRDWEB_CLIENT_ID) {
  console.warn('You need to provide a NEXT_PUBLIC_THIRDWEB_CLIENT_ID env variable')
}

// Thirdweb configuration
export const THIRDWEB_CONFIG = {
  clientId: THIRDWEB_CLIENT_ID,
  networks: ETH_CHAINS,
  ssr: true,
}
