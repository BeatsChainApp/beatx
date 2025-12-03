export default function PrivacyPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <PrivacyPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function PrivacyPageContent() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        Privacy Policy
      </h1>
      
      <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#374151' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            1. Information We Collect
          </h2>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem', color: '#1f2937' }}>
            Personal Information
          </h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Email address and profile information</li>
            <li>Wallet addresses (public blockchain data)</li>
            <li>Payment and transaction history</li>
            <li>Content uploads (beats, images, descriptions)</li>
          </ul>
          
          <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem', color: '#1f2937' }}>
            Technical Information
          </h3>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>IP address and device information</li>
            <li>Browser type and usage analytics</li>
            <li>Platform interaction data</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            2. How We Use Your Information
          </h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Facilitate transactions and payments</li>
            <li>Provide customer support</li>
            <li>Improve platform functionality</li>
            <li>Send important updates and notifications</li>
            <li>Comply with legal requirements</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            3. Information Sharing
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We do not sell personal information. We may share data with:
          </p>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Service providers (Firebase, payment processors)</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners for transaction processing</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            4. Data Storage and Security
          </h2>
          <p>
            Data is stored on secure cloud infrastructure (Firebase/Google Cloud). We implement industry-standard security measures including encryption and access controls.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            5. Blockchain Transparency
          </h2>
          <p>
            Cryptocurrency transactions are permanently recorded on public blockchains. Wallet addresses and transaction amounts are publicly visible but not directly linked to personal identity.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            6. Your Rights (POPIA Compliance)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Under South Africa's Protection of Personal Information Act (POPIA), you have the right to:
          </p>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Object to processing</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            7. Cookies and Analytics
          </h2>
          <p>
            We use essential cookies for platform functionality and analytics cookies to improve user experience. You can disable non-essential cookies in your browser settings.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            8. Contact Information
          </h2>
          <p>
            For privacy concerns or data requests, contact us at:<br/>
            Email: privacy@beatschain.app<br/>
            Address: 1033 Section 1, Madadeni, 2951, South Africa
          </p>
        </section>

        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '2rem' }}>
          Last updated: January 2025
        </p>
      </div>
    </div>
  )
}