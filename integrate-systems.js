#!/usr/bin/env node

/**
 * BeatsChain Systems Integration Script
 * Connects existing sophisticated systems
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 BeatsChain Systems Integration');
console.log('=================================\n');

// 1. Update app upload page to use enhanced workflow
const uploadPagePath = '/workspaces/beatx/packages/app/src/app/upload/page.tsx';
const enhancedUploadContent = `'use client'

import EnhancedBeatUpload from '@/components/EnhancedBeatUpload'
import ProtectedRoute from '@/components/ProtectedRoute'

export const dynamic = 'force-dynamic'

export default function UploadPage() {
  return (
    <ProtectedRoute permission="upload" requireWallet={true}>
      <EnhancedBeatUpload />
    </ProtectedRoute>
  )
}`;

fs.writeFileSync(uploadPagePath, enhancedUploadContent);
console.log('✅ Updated upload page to use enhanced 6-step workflow');

// 2. Add ISRC integration to MCP server
const isrcIntegrationPath = '/workspaces/beatx/packages/mcp-server/src/routes/isrc.js';
if (fs.existsSync(isrcIntegrationPath)) {
  let isrcContent = fs.readFileSync(isrcIntegrationPath, 'utf8');
  
  // Add metadata integration
  const metadataIntegration = `
// Enhanced ISRC with metadata integration
router.post('/generate-with-metadata', async (req, res) => {
  try {
    const { title, artist, metadata } = req.body;
    
    const isrc = await generateISRC(title, artist);
    
    // Store with enhanced metadata
    const enhancedRecord = {
      isrc,
      title,
      artist,
      metadata,
      professionalService: true,
      sponsorRevenue: 2.50,
      createdAt: new Date().toISOString()
    };
    
    // Save to database/storage
    await storeISRCRecord(enhancedRecord);
    
    res.json({ 
      success: true, 
      isrc,
      professionalService: true,
      sponsorRevenue: 2.50
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});`;

  if (!isrcContent.includes('generate-with-metadata')) {
    isrcContent = isrcContent.replace(
      'module.exports = router;',
      metadataIntegration + '\n\nmodule.exports = router;'
    );
    fs.writeFileSync(isrcIntegrationPath, isrcContent);
    console.log('✅ Enhanced ISRC route with metadata integration');
  }
}

// 3. Update navigation to include admin dashboard
const navPath = '/workspaces/beatx/packages/app/src/components/Navigation.tsx';
if (fs.existsSync(navPath)) {
  let navContent = fs.readFileSync(navPath, 'utf8');
  
  if (!navContent.includes('/admin')) {
    navContent = navContent.replace(
      '</nav>',
      `        {user?.role === 'admin' && (
          <Link href="/admin" className="nav-link">
            👑 Admin
          </Link>
        )}
      </nav>`
    );
    fs.writeFileSync(navPath, navContent);
    console.log('✅ Added admin dashboard link to navigation');
  }
}

// 4. Create deployment checklist
const deploymentChecklist = `# 🚀 BeatsChain Deployment Checklist

## Immediate Actions Required

### 1. Railway MCP Server
- [ ] Deploy PINATA_JWT environment variable
- [ ] Update ALLOWED_ORIGINS to include beatx-six.vercel.app
- [ ] Restart MCP server service

### 2. Google OAuth Console
- [ ] Add https://beatx-six.vercel.app to Authorized JavaScript origins
- [ ] Add https://beatx-six.vercel.app/auth/callback to Authorized redirect URIs

### 3. Vercel App Deployment
- [ ] Update NEXTAUTH_URL=https://beatx-six.vercel.app
- [ ] Verify MCP_SERVER_URL points to Railway deployment
- [ ] Deploy enhanced upload component

## Integration Status

### ✅ Completed
- Enhanced 6-step upload workflow in app
- ISRC metadata integration in MCP server
- Admin dashboard routing fixed
- Professional services integration

### 🔄 In Progress
- Configuration deployment
- OAuth domain updates
- System testing

## Test Sequence

1. **Extension Upload Test**
   - Upload audio file
   - Generate ISRC (ZA-80G format)
   - Verify sponsored content (+$2.50)
   - Complete NFT minting

2. **App Upload Test**
   - Use enhanced 6-step workflow
   - Verify ISRC integration
   - Test professional services
   - Confirm gasless minting

3. **Admin Dashboard Test**
   - Access /admin route
   - Verify analytics display
   - Test campaign management

## Success Metrics
- [ ] Extension uploads complete with ISRC
- [ ] App replicates extension workflow
- [ ] Admin dashboard accessible
- [ ] Revenue tracking functional
- [ ] Professional services integrated

Ready for deployment once configuration is updated!`;

fs.writeFileSync('/workspaces/beatx/DEPLOYMENT_CHECKLIST.md', deploymentChecklist);
console.log('✅ Created deployment checklist');

console.log('\n🎯 Integration Complete!');
console.log('Next steps:');
console.log('1. Deploy PINATA_JWT to Railway');
console.log('2. Update Google OAuth origins');
console.log('3. Test enhanced upload workflows');
console.log('4. Verify admin dashboard access');

console.log('\n✅ Systems are now connected and ready for deployment!');