import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'

export default function DisclaimerPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <DisclaimerPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function DisclaimerPageContent() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        Web3 & Cryptocurrency Disclaimer
      </h1>
      
      <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#374151' }}>
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem' }}>
            ⚠️ Important Risk Warning
          </h2>
          <p style={{ color: '#dc2626', margin: 0 }}>
            Cryptocurrency investments and Web3 transactions involve significant financial risk. Only invest what you can afford to lose.
          </p>
        </div>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            1. Cryptocurrency Risks
          </h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li><strong>Volatility:</strong> Cryptocurrency values can fluctuate dramatically</li>
            <li><strong>Irreversible Transactions:</strong> Blockchain transactions cannot be reversed</li>
            <li><strong>Technical Risks:</strong> Smart contract bugs or network issues may cause losses</li>
            <li><strong>Regulatory Changes:</strong> Government regulations may affect cryptocurrency use</li>
            <li><strong>Loss of Access:</strong> Lost private keys mean permanent loss of funds</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            2. NFT and Digital Asset Risks
          </h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li><strong>Speculative Nature:</strong> NFT values are highly speculative</li>
            <li><strong>No Guaranteed Value:</strong> Digital assets may become worthless</li>
            <li><strong>Platform Dependency:</strong> Asset accessibility depends on platform availability</li>
            <li><strong>Copyright Issues:</strong> Ownership of NFT doesn't guarantee copyright ownership</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            3. Platform Limitations
          </h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>BeatsChain is not a financial advisor or investment platform</li>
            <li>We do not guarantee transaction success or asset value</li>
            <li>Platform availability may be interrupted for maintenance</li>
            <li>Third-party integrations may affect functionality</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            4. Tax Implications
          </h2>
          <p>
            Cryptocurrency transactions may have tax implications in your jurisdiction. Consult with a qualified tax professional regarding your obligations.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            5. Regulatory Compliance
          </h2>
          <p>
            Users are responsible for complying with local laws and regulations regarding cryptocurrency use, including but not limited to:
          </p>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>South African Reserve Bank regulations</li>
            <li>Financial Intelligence Centre Act (FICA)</li>
            <li>International sanctions and restrictions</li>
            <li>Anti-money laundering (AML) requirements</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            6. No Financial Advice
          </h2>
          <p>
            Content on BeatsChain is for informational purposes only and does not constitute financial, investment, or legal advice. Always conduct your own research and consult professionals before making financial decisions.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            7. Age Restrictions
          </h2>
          <p>
            Users must be 18 years or older to use cryptocurrency features. Minors require parental consent and supervision.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            8. Limitation of Liability
          </h2>
          <p>
            BeatsChain, its founders, and affiliates are not liable for any losses, damages, or consequences arising from cryptocurrency transactions, market volatility, or platform use.
          </p>
        </section>

        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0c4a6e', marginBottom: '0.5rem' }}>
            📚 Educational Resources
          </h3>
          <p style={{ color: '#0c4a6e', margin: 0 }}>
            We encourage users to educate themselves about cryptocurrency and blockchain technology before participating in Web3 transactions.
          </p>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '2rem' }}>
          Last updated: January 2025
        </p>
      </div>
    </div>
  )
}