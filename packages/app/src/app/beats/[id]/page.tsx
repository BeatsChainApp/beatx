import { redirect } from 'next/navigation'
import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'

export default function BeatsRedirect() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <BeatsRedirectContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function BeatsRedirectContent() {
  // Redirect /beats/[id] to /beat/[id] (singular)
  redirect('/browse')
}