import { redirect } from 'next/navigation'
import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'

export default function ProducersRedirect() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <ProducersRedirectContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function ProducersRedirectContent() {
  // Redirect /producers/[id] to /producer/[id] (singular)
  redirect('/producers')
}