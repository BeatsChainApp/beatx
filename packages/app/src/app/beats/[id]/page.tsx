import { redirect } from 'next/navigation'

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
  redirect(`/beat/${params.id}`)
}