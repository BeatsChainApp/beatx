export default function TermsPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <TermsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function TermsPageContent() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        Terms of Use
      </h1>
      
      <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#374151' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using BeatsChain, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            2. Platform Description
          </h2>
          <p>
            BeatsChain is a Web3-native marketplace connecting South African music producers with global artists through cryptocurrency transactions, NFT ownership, and the BeatNFT credit system. The platform operates on blockchain technology ensuring transparent, decentralized music commerce.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            3. User Responsibilities
          </h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Provide accurate account information</li>
            <li>Maintain security of your wallet and login credentials</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Respect intellectual property rights</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            4. Intellectual Property & NFT Ownership
          </h2>
          <p>
            Producers retain copyright of their original works and stage name rights. NFT ownership grants specific usage rights as defined in license terms, not copyright ownership. Smart contracts automatically distribute royalties to original creators on resales. BeatsChain facilitates transactions but does not claim ownership of user content or stage names.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            5. Payment Terms & BeatNFT Credits
          </h2>
          <p>
            Platform commission: 2.5% of each transaction. BeatNFT Credit System: MP3 uploads (1 credit), WAV uploads (2 credits), ZIP packages (3-5 credits). New users receive 10 free credits. Pro BeatNFT (0.1 ETH) provides unlimited uploads. All cryptocurrency transactions are irreversible.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            6. Preview & Access Rights
          </h2>
          <p>
            All beats include 30-second previews for discovery purposes. Full beat access requires purchase or valid listener credits. Stem packages include individual layer previews where available. Preview usage is limited to platform discovery and does not grant commercial usage rights.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            7. Prohibited Activities
          </h2>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Uploading copyrighted material without permission</li>
            <li>Fraudulent transactions or chargebacks</li>
            <li>Harassment or abuse of other users</li>
            <li>Circumventing platform fees</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            8. Limitation of Liability
          </h2>
          <p>
            BeatsChain is not liable for losses due to market volatility, technical issues, or user error. Use at your own risk.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            9. Web3 & Smart Contract Terms
          </h2>
          <p>
            Smart contracts are immutable and execute automatically. Users are responsible for wallet security and transaction verification. Gas fees are user responsibility. Platform operates across multiple blockchain networks.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            10. Governing Law
          </h2>
          <p>
            These terms are governed by the laws of South Africa. Disputes will be resolved in South African courts. Blockchain transactions are subject to network consensus rules.
          </p>
        </section>

        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '2rem' }}>
          Last updated: December 2024 - Web3 Enhanced Version<br/>
          Operated by Unami Foundation NPC
        </p>
      </div>
    </div>
  )
}