import { redirect } from 'next/navigation'

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
  redirect(`/producer/${params.id}`)
}