'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState } from 'react'

export default function FAQPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <FAQPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function FAQPageContent() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'What is BeatsChain?',
          a: 'BeatsChain is a Web3 marketplace where music producers can sell beats as NFTs and earn royalties forever. Artists can buy high-quality beats with transparent licensing.'
        },
        {
          q: 'Do I need cryptocurrency to use BeatsChain?',
          a: 'No! While we support crypto payments, you can also pay with credit cards. We accept both traditional payments and Web3 wallets.'
        },
        {
          q: 'How do I get started as a producer?',
          a: 'Simply sign up, connect your wallet (optional), upload your beats with metadata, set your price in Rand, and start earning!'
        }
      ]
    },
    {
      category: 'For Producers',
      questions: [
        {
          q: 'What file formats can I upload?',
          a: 'We accept MP3, WAV, and FLAC files. For best quality, we recommend 320kbps MP3 or higher quality WAV files.'
        },
        {
          q: 'How much can I earn from my beats?',
          a: 'You set your own prices in South African Rand. Plus, you earn automatic royalties on every resale through smart contracts - forever!'
        },
        {
          q: 'What happens to my copyright?',
          a: 'You retain full copyright ownership. BeatsChain just facilitates the sale and licensing. Your ownership is protected by blockchain technology.'
        }
      ]
    },
    {
      category: 'For Artists',
      questions: [
        {
          q: 'What license types are available?',
          a: 'We offer Basic (non-commercial), Premium (commercial use), and Exclusive (full rights) licenses. Each has different usage rights and pricing.'
        },
        {
          q: 'Can I use purchased beats commercially?',
          a: 'Yes, with Premium or Exclusive licenses. Basic licenses are for non-commercial use only. Check each beat\'s license details before purchasing.'
        },
        {
          q: 'How do I download my purchased beats?',
          a: 'After purchase, beats are instantly available in your Library. You can download them anytime with your license agreement.'
        }
      ]
    },
    {
      category: 'Payments & Pricing',
      questions: [
        {
          q: 'What currencies do you accept?',
          a: 'All prices are in South African Rand (R). We accept credit cards, Ethereum (ETH), USDC, and other cryptocurrencies.'
        },
        {
          q: 'Are there any fees?',
          a: 'BeatsChain takes a small commission on sales. Producers keep the majority of their earnings. No hidden fees for buyers.'
        },
        {
          q: 'How do royalties work?',
          a: 'Smart contracts automatically distribute royalties to producers on every resale. No manual intervention needed - it\'s all automated on the blockchain.'
        }
      ]
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'What blockchain does BeatsChain use?',
          a: 'We use Ethereum blockchain for NFT minting and smart contracts, ensuring security, transparency, and permanent ownership records.'
        },
        {
          q: 'Do I need to understand blockchain to use BeatsChain?',
          a: 'Not at all! Our platform is designed to be user-friendly. You can use it just like any other music marketplace, with optional Web3 features.'
        },
        {
          q: 'Is my data secure?',
          a: 'Yes! We use enterprise-grade security, blockchain verification, and comply with South African data protection laws (POPIA).'
        }
      ]
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            ❓ Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
            Everything you need to know about BeatsChain
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              🎵 For Producers
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              🎤 For Artists
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              💡 Quick Answers
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} style={{ marginBottom: '3rem' }}>
            <h2 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem', 
              color: '#1f2937',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '0.5rem'
            }}>
              {category.category}
            </h2>
            
            <div style={{ space: '1rem' }}>
              {category.questions.map((faq, faqIndex) => {
                const globalIndex = categoryIndex * 100 + faqIndex
                const isOpen = openFAQ === globalIndex
                
                return (
                  <div key={faqIndex} style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => setOpenFAQ(isOpen ? null : globalIndex)}
                      style={{
                        width: '100%',
                        padding: '1.5rem',
                        textAlign: 'left',
                        background: isOpen ? '#f9fafb' : 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}
                    >
                      <span>{faq.q}</span>
                      <span style={{ 
                        fontSize: '1.5rem',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}>
                        +
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div style={{
                        padding: '0 1.5rem 1.5rem 1.5rem',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        borderTop: '1px solid #e5e7eb',
                        background: '#f9fafb'
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Contact Section */}
        <div style={{
          background: '#1f2937',
          color: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          textAlign: 'center',
          marginTop: '4rem'
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Still Have Questions?
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}>
            Our support team is here to help you succeed on BeatsChain
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/contact"
              style={{
                background: '#fbbf24',
                color: '#1f2937',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.125rem'
              }}
            >
              📞 Contact Support
            </a>
            {/* Discord link removed */}
          </div>
        </div>
      </div>
    </div>
  )
}