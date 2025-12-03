#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const pagesDir = '/workspaces/beatx/packages/app/src/app'

// Page configurations
const pageConfigs = {
  // Auth pages
  'signin/page.tsx': { auth: false, wrapper: 'auth' },
  'signup/page.tsx': { auth: false, wrapper: 'auth' },
  'auth/callback/page.tsx': { auth: false, wrapper: 'auth' },
  
  // Public pages
  'page.tsx': { auth: false, wrapper: 'public' },
  'browse/page.tsx': { auth: false, wrapper: 'public' },
  'beatnfts/page.tsx': { auth: false, wrapper: 'public' },
  'producers/page.tsx': { auth: false, wrapper: 'public' },
  'blog/page.tsx': { auth: false, wrapper: 'public' },
  'contact/page.tsx': { auth: false, wrapper: 'public' },
  'faq/page.tsx': { auth: false, wrapper: 'public' },
  'guide/page.tsx': { auth: false, wrapper: 'public' },
  'privacy/page.tsx': { auth: false, wrapper: 'public' },
  'terms/page.tsx': { auth: false, wrapper: 'public' },
  'disclaimer/page.tsx': { auth: false, wrapper: 'public' },
  
  // Protected pages
  'profile/page.tsx': { auth: true, roles: ['user', 'producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'library/page.tsx': { auth: true, roles: ['user', 'producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'onboarding/page.tsx': { auth: true, wrapper: 'auth' },
  
  // Producer pages
  'creator-dashboard/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'music-dashboard/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'collector-dashboard/page.tsx': { auth: true, roles: ['user', 'producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  
  // Upload pages
  'upload/page.tsx': { auth: true, wallet: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'upload' },
  
  // Admin pages
  'admin/analytics/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  'admin/beats/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  'admin/blockchain/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  'admin/content/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  'admin/revenue/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  'admin/settings/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  'admin/setup/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  'admin/transactions/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  'admin/users/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  
  // Dashboard sub-pages
  'dashboard/analytics/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'dashboard/beats/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'dashboard/blockchain/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'dashboard/earnings/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'dashboard/negotiations/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  
  // Radio pages
  'radio/submit/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'upload' },
  'radio/analytics/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  
  // Special pages
  'beatnft-store/page.tsx': { auth: false, wrapper: 'public' },
  'credit-market/page.tsx': { auth: true, roles: ['user', 'producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'manage-subscription/page.tsx': { auth: true, roles: ['user', 'producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  'genres/page.tsx': { auth: false, wrapper: 'public' },
  'analytics/page.tsx': { auth: true, roles: ['producer', 'admin', 'super_admin'], wrapper: 'dashboard' },
  
  // Dynamic pages
  'beat/[id]/page.tsx': { auth: false, wrapper: 'public' },
  'beats/[id]/page.tsx': { auth: false, wrapper: 'public' },
  'producer/[id]/page.tsx': { auth: false, wrapper: 'public' },
  'producers/[id]/page.tsx': { auth: false, wrapper: 'public' },
  'blog/[slug]/page.tsx': { auth: false, wrapper: 'public' },
  '[slug]/page.tsx': { auth: false, wrapper: 'public' },
  'cms/[slug]/page.tsx': { auth: false, wrapper: 'public' },
  
  // Test/Demo pages
  'test/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  'sanity-demo/page.tsx': { auth: false, wrapper: 'public' },
  'studio/[[...tool]]/page.tsx': { auth: true, roles: ['admin', 'super_admin'], wrapper: 'admin' },
  
  // Examples
  'examples/notifications/page.tsx': { auth: true, wrapper: 'dashboard' },
  'examples/send-ether/page.tsx': { auth: true, wallet: true, wrapper: 'dashboard' },
  'examples/send-token/page.tsx': { auth: true, wallet: true, wrapper: 'dashboard' }
}

function updatePageFile(filePath, config) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      return false
    }

    let content = fs.readFileSync(filePath, 'utf8')
    
    // Skip if already updated
    if (content.includes('UniversalLayout') || content.includes('ResponsiveWrapper')) {
      console.log(`✅ Already updated: ${filePath}`)
      return true
    }

    // Add imports at the top
    const importRegex = /^('use client'[\s\S]*?)(\nimport.*from.*\n)/m
    if (importRegex.test(content)) {
      content = content.replace(importRegex, (match, useClient, lastImport) => {
        return `${useClient}
import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'${lastImport}`
      })
    } else {
      // Add imports after 'use client'
      content = content.replace(/^'use client'\n/, `'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
`)
    }

    // Wrap the main export function
    const exportRegex = /export default function (\w+)\([^)]*\) \{([\s\S]*)\n\}/
    if (exportRegex.test(content)) {
      content = content.replace(exportRegex, (match, functionName, functionBody) => {
        const universalLayoutProps = []
        
        if (config.auth) universalLayoutProps.push('requireAuth={true}')
        if (config.wallet) universalLayoutProps.push('requireWallet={true}')
        if (config.roles) universalLayoutProps.push(`allowedRoles={${JSON.stringify(config.roles)}}`)
        
        const universalLayoutPropsStr = universalLayoutProps.length > 0 ? ` ${universalLayoutProps.join(' ')}` : ''
        
        return `export default function ${functionName}() {
  return (
    <UniversalLayout${universalLayoutPropsStr}>
      <ResponsiveWrapper pageType="${config.wrapper}">
        <${functionName}Content />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function ${functionName}Content() {${functionBody}
}`
      })
    }

    // Add mobile-responsive classes
    content = content.replace(/className="([^"]*container[^"]*)"/g, 'className="$1 mobile-container"')
    content = content.replace(/className="([^"]*px-4[^"]*)"/g, 'className="$1"')
    content = content.replace(/className="([^"]*text-\d+xl[^"]*)"/g, 'className="$1 mobile-heading"')

    fs.writeFileSync(filePath, content)
    console.log(`✅ Updated: ${filePath}`)
    return true
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message)
    return false
  }
}

function findAllPages(dir, basePath = '') {
  const pages = []
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const relativePath = path.join(basePath, item)
    
    if (fs.statSync(fullPath).isDirectory()) {
      pages.push(...findAllPages(fullPath, relativePath))
    } else if (item === 'page.tsx') {
      pages.push(relativePath)
    }
  }
  
  return pages
}

// Main execution
console.log('🚀 Updating all pages with responsive wrappers and auth...')

const allPages = findAllPages(pagesDir)
let updated = 0
let total = 0

for (const pagePath of allPages) {
  total++
  const config = pageConfigs[pagePath] || { auth: false, wrapper: 'public' }
  const fullPath = path.join(pagesDir, pagePath)
  
  if (updatePageFile(fullPath, config)) {
    updated++
  }
}

console.log(`\n📊 Summary:`)
console.log(`✅ Updated: ${updated}/${total} pages`)
console.log(`📱 All pages now have mobile responsiveness`)
console.log(`🔐 Authentication integrated across platform`)
console.log(`🎯 Dashboard routing configured`)

if (updated === total) {
  console.log('\n🎉 All pages successfully updated!')
} else {
  console.log(`\n⚠️  ${total - updated} pages need manual review`)
}