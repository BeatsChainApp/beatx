# 🎵 BeatsChain Radio Submission System - Comprehensive Implementation Playbook

## 📋 Executive Summary

This playbook provides complete specifications for implementing the Chrome Extension's radio submission system in the Next.js app dashboards. The system includes audio analysis, metadata extraction, ISRC generation, splitsheet management, SAMRO compliance, sponsored content placements, and comprehensive data pipelines.

## 🎯 System Architecture Overview

### Extension vs App - Separate Concerns, Same Logic

**Chrome Extension (Artist-Focused)**:
- Direct radio station submission workflow
- Real-time audio processing and validation
- Immediate ISRC generation and embedding
- Sponsored content during submission flow
- Package download for radio stations

**Next.js App (Producer/Admin-Focused)**:
- Dashboard-based radio submission management
- Batch processing and campaign management
- Analytics and performance tracking
- Admin oversight and campaign optimization
- Mobile-responsive interface

## 🔧 Core System Components

### 1. Audio Analysis & Metadata Extraction

**Extension Implementation**: `audio-tagging-manager.js`
```javascript
class AudioTaggingManager {
  // ISRC extraction from MP3 ID3v2 tags
  async extractISRCFromMP3(file) {
    // Parses ID3v2 TSRC frames for embedded ISRC codes
  }
  
  // ISRC extraction from WAV BWF metadata
  async extractISRCFromWAV(file) {
    // Parses BWF broadcast extension chunks
  }
  
  // Enhanced metadata with ISRC capabilities
  async enhanceAudioMetadata(audioFile, existingMetadata) {
    return {
      extractedISRC: extractedISRC,
      hasEmbeddedISRC: !!extractedISRC,
      supportsISRCEmbedding: this.supportsISRCEmbedding(format),
      audioTaggingCapable: true
    }
  }
}
```

**App Implementation Required**:
```typescript
// packages/app/src/lib/audio-analysis.ts
export class AppAudioAnalyzer {
  async analyzeAudioFile(file: File): Promise<AudioAnalysis> {
    // Web Audio API analysis
    // Format detection (MP3, WAV, FLAC)
    // Duration, bitrate, sample rate extraction
    // Embedded metadata parsing
    // ISRC detection from audio tags
  }
  
  async extractMetadata(file: File): Promise<TrackMetadata> {
    // ID3 tag parsing for MP3
    // BWF metadata for WAV
    // Vorbis comments for FLAC
    // Return structured metadata object
  }
}
```

### 2. ISRC Generation & Management

**Extension Implementation**: `isrc-manager.js`
```javascript
class ISRCManager {
  constructor() {
    this.registrantCode = '80G'; // Confirmed registrant code
    this.territory = 'ZA'; // South African territory
  }
  
  async generateISRC(trackTitle, artistName) {
    // Format: ZA-80G-YY-NNNNN
    // User-specific designation ranges
    // Collision prevention
    // Persistent storage
  }
}
```

**App Implementation Required**:
```typescript
// packages/app/src/lib/isrc-manager.ts
export class AppISRCManager {
  private registrantCode = '80G'
  private territory = 'ZA'
  
  async generateISRC(metadata: TrackMetadata): Promise<ISRCResult> {
    // Server-side ISRC generation via MCP
    // Database persistence
    // User range management
    // Validation and format checking
  }
  
  async validateISRC(isrc: string): boolean {
    // ZA-80G-YY-NNNNN format validation
    // Duplicate checking
    // Registry verification
  }
}
```

### 3. Radio Metadata Management

**Extension Implementation**: `radio-metadata.js`
```javascript
class RadioMetadataManager {
  createMetadataForm() {
    // Track title, artist name, genre selection
    // Language selection (11 SA languages)
    // Content rating (clean/explicit)
    // Artist biography and influences
    // Social media links
    // Real-time validation
  }
  
  getTrackMetadata() {
    // User input priority system
    // Sanitized and validated data
    // ISRC integration
    // Radio-specific formatting
  }
}
```

**App Implementation Required**:
```typescript
// packages/app/src/components/radio/RadioMetadataForm.tsx
export default function RadioMetadataForm({ onSubmit }: Props) {
  return (
    <form className="space-y-6">
      {/* Track Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Track Title" required />
        <FormField label="Artist Name" required />
        <GenreSelect options={SA_GENRES} />
        <LanguageSelect options={SA_LANGUAGES} />
      </div>
      
      {/* Artist Biography */}
      <TextArea label="Biography" maxLength={500} />
      
      {/* Social Media */}
      <SocialMediaFields />
      
      {/* Validation & Submit */}
      <ValidationStatus />
      <SubmitButton />
    </form>
  )
}
```

### 4. Enhanced Radio Flow with Splitsheets & SAMRO

**Extension Implementation**: `enhanced-radio-flow.js`
```javascript
class EnhancedRadioFlow {
  constructor() {
    this.steps = [
      'upload',      // Audio file upload
      'metadata',    // Track information
      'splitsheets', // Contributor management
      'samro',       // SAMRO compliance
      'isrc',        // ISRC generation
      'package',     // Package creation
      'download'     // Final download
    ]
  }
  
  addSplitsheetStep() {
    // Contributors with percentages
    // ID/Passport validation
    // SAMRO member numbers
    // 100% validation requirement
  }
  
  addSAMROStep() {
    // SAMRO documentation generation
    // Composer split confirmation
    // PDF generation integration
  }
}
```

**App Implementation Required**:
```typescript
// packages/app/src/components/radio/RadioSubmissionWizard.tsx
export default function RadioSubmissionWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    { id: 'upload', component: AudioUploadStep },
    { id: 'metadata', component: MetadataStep },
    { id: 'splitsheets', component: SplitsheetsStep },
    { id: 'samro', component: SAMROStep },
    { id: 'signatures', component: SignatureStep },
    { id: 'isrc', component: ISRCStep },
    { id: 'package', component: PackageStep },
    { id: 'download', component: DownloadStep }
  ]
  
  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator steps={steps} current={currentStep} />
      <StepContent step={steps[currentStep]} />
      <StepNavigation onNext={handleNext} onPrev={handlePrev} />
    </div>
  )
}
```

### 5. Splitsheet Management

**Extension Implementation**: `samro-split-manager.js`
```javascript
class SAMROSplitManager {
  generateSplitSheet(trackData, contributors) {
    return {
      trackTitle: trackData.title,
      isrc: trackData.isrc,
      contributors: contributors.map(c => ({
        name: c.name,
        role: c.role, // Composer, Lyricist, Producer
        percentage: c.percentage,
        ipi: c.ipi,
        samroMember: c.samroMember
      })),
      totalPercentage: contributors.reduce((sum, c) => sum + c.percentage, 0)
    }
  }
}
```

**App Implementation Required**:
```typescript
// packages/app/src/components/radio/SplitsheetManager.tsx
export default function SplitsheetManager({ onComplete }: Props) {
  const [contributors, setContributors] = useState<Contributor[]>([])
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold">Splitsheet Management</h3>
        <p>Define contributor splits for radio submission</p>
      </div>
      
      <ContributorList 
        contributors={contributors}
        onChange={setContributors}
      />
      
      <AddContributorButton onClick={addContributor} />
      
      <ValidationSummary 
        total={getTotalPercentage()}
        isValid={getTotalPercentage() === 100}
      />
      
      <ActionButtons 
        onSkip={handleSkip}
        onSave={handleSave}
        disabled={!isValid}
      />
    </div>
  )
}
```

### 6. Sponsored Content Placement System

**Extension Implementation**: `radio-sponsor-integration.js`
```javascript
class RadioSponsorIntegration {
  setupRadioHooks(app) {
    // 7 strategic placement points:
    // 1. After audio upload (1200ms delay)
    // 2. After metadata entry (800ms delay)  
    // 3. After splitsheet completion (900ms delay)
    // 4. After SAMRO generation (1100ms delay)
    // 5. After ISRC generation (1500ms delay)
    // 6. Before package download (500ms delay)
    // 7. Post-success follow-up (2500ms delay)
  }
  
  displaySponsorContent(placement, container, context) {
    // South African radio industry sponsors
    // Legal services, compliance, promotion
    // Revenue tracking per placement
  }
}
```

**App Implementation Required**:
```typescript
// packages/app/src/components/radio/SponsorPlacementManager.tsx
export class AppSponsorManager {
  private placements = [
    'upload_complete',
    'metadata_complete', 
    'splitsheet_complete',
    'samro_complete',
    'isrc_complete',
    'package_ready',
    'submission_success'
  ]
  
  async displaySponsor(placement: string, context: any) {
    // Fetch active campaigns for placement
    // Display sponsor content with proper timing
    // Track impressions and clicks
    // Revenue attribution
  }
}
```

## 🎯 Sponsored Content Revenue System

### 7 Strategic Placement Points

**1. Upload Complete (1200ms delay)**
- Service: Radio Mastering Services
- Revenue: R2.50 per impression
- Target: Audio quality optimization

**2. Metadata Complete (800ms delay)**
- Service: Metadata Enhancement Services  
- Revenue: R2.00 per impression
- Target: Professional metadata optimization

**3. Splitsheet Complete (900ms delay)**
- Service: Legal Protection Services
- Revenue: R3.50 per impression
- Target: Legal review and copyright protection

**4. SAMRO Complete (1100ms delay)**
- Service: SAMRO Compliance Pro
- Revenue: R4.00 per impression
- Target: Expert SAMRO documentation

**5. ISRC Complete (1500ms delay)**
- Service: Professional ISRC Services
- Revenue: R2.50 per impression
- Target: ISRC registration and compliance

**6. Package Ready (500ms delay)**
- Service: Premium Services Suite
- Revenue: R5.00 per impression
- Target: Advanced radio submission tools

**7. Submission Success (2500ms delay)**
- Service: Radio Analytics & Monitoring
- Revenue: R6.00 per impression
- Target: Airplay tracking and analytics

### Revenue Tracking Implementation

```typescript
// packages/app/src/lib/revenue-tracker.ts
export class RadioRevenueTracker {
  async trackPlacementRevenue(placement: string, amount: number) {
    const data = {
      placement_type: placement,
      revenue_amount: amount,
      timestamp: new Date().toISOString(),
      platform: 'app',
      flow_type: 'radio_submission'
    }
    
    // Send to MCP server
    await fetch(`${MCP_SERVER_URL}/api/campaigns/track-revenue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }
}
```

## 🔄 N8N Workflow Integration

### Enhanced Radio Placements Workflow

**Workflow**: `enhanced-radio-placements.json`
- **Trigger**: Webhook for radio placement events
- **Router**: Routes by placement type
- **Processors**: 5 specialized processors for each placement
- **Revenue Tracking**: MCP server integration
- **Analytics**: Supabase logging

**Key Features**:
- Real-time revenue attribution
- Enhanced context tracking
- Campaign performance metrics
- South African radio market focus

### Implementation in App

```typescript
// packages/app/src/lib/n8n-integration.ts
export class N8NRadioIntegration {
  private webhookUrl = `${N8N_SERVER_URL}/webhook/enhanced-radio-placement`
  
  async triggerPlacement(placement: string, context: any) {
    const payload = {
      placement_type: placement,
      user_id: context.userId,
      timestamp: new Date().toISOString(),
      ...context
    }
    
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
}
```

## 📱 Dashboard Implementation Strategy

### Producer Dashboard Integration

**Location**: `packages/app/src/app/producer/page.tsx`

```typescript
export default function ProducerDashboard() {
  return (
    <div className="space-y-6">
      {/* Existing producer content */}
      
      {/* Radio Submission Card */}
      <RadioSubmissionCard />
      
      {/* Radio Analytics */}
      <RadioAnalyticsWidget />
    </div>
  )
}
```

**Radio Submission Card**:
```typescript
// packages/app/src/components/producer/RadioSubmissionCard.tsx
export default function RadioSubmissionCard() {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white">
      <h3 className="text-xl font-bold mb-2">📻 Radio Submission</h3>
      <p className="mb-4">Submit your tracks to South African radio stations</p>
      <div className="flex space-x-4">
        <Button onClick={() => router.push('/radio/submit')}>
          Start Submission
        </Button>
        <Button variant="outline" onClick={() => router.push('/radio/analytics')}>
          View Analytics
        </Button>
      </div>
    </div>
  )
}
```

### Admin Dashboard Integration

**Location**: `packages/app/src/app/admin/page.tsx`

**Enhanced Campaign Manager**:
```typescript
// Add radio-specific campaign types to existing CampaignManager.tsx
const RADIO_PLACEMENTS = {
  'upload_complete': 'After Audio Upload',
  'metadata_complete': 'After Metadata Entry',
  'splitsheet_complete': 'After Splitsheet Entry',
  'samro_complete': 'After SAMRO Generation',
  'isrc_complete': 'After ISRC Generation',
  'package_ready': 'Before Package Download',
  'submission_success': 'Post-Success Follow-up'
}
```

**Radio Revenue Analytics**:
```typescript
// packages/app/src/components/admin/RadioRevenueAnalytics.tsx
export default function RadioRevenueAnalytics() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">📻 Radio Revenue Analytics</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Radio Revenue" value="R1,234.56" />
        <MetricCard title="Active Radio Campaigns" value="12" />
        <MetricCard title="Avg Revenue per Submission" value="R23.45" />
      </div>
      
      <PlacementRevenueChart />
    </div>
  )
}
```

### Creator Dashboard (If Available)

**Location**: `packages/app/src/app/creator/page.tsx`

```typescript
// packages/app/src/components/creator/RadioPerformanceWidget.tsx
export default function RadioPerformanceWidget() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">📻 Radio Performance</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Submissions This Month</span>
          <span className="font-semibold">8</span>
        </div>
        <div className="flex justify-between">
          <span>Successful Submissions</span>
          <span className="font-semibold text-green-600">6</span>
        </div>
        <div className="flex justify-between">
          <span>Revenue Generated</span>
          <span className="font-semibold text-blue-600">R187.50</span>
        </div>
      </div>
      
      <Button className="w-full mt-4" onClick={() => router.push('/radio/submit')}>
        Submit New Track
      </Button>
    </div>
  )
}
```

## 🗄️ Database Schema Extensions

### Radio Submissions Table

```sql
-- packages/app/migrations/add_radio_submissions.sql
CREATE TABLE radio_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  track_title VARCHAR(200) NOT NULL,
  artist_name VARCHAR(100) NOT NULL,
  genre VARCHAR(50),
  language VARCHAR(50),
  isrc VARCHAR(15),
  
  -- Splitsheet data
  contributors JSONB,
  total_percentage INTEGER DEFAULT 100,
  
  -- SAMRO data
  samro_member_number VARCHAR(20),
  samro_documentation JSONB,
  
  -- Package data
  package_components JSONB,
  package_size_mb DECIMAL,
  download_url TEXT,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'draft',
  submission_step INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);
```

### Radio Revenue Tracking

```sql
-- packages/app/migrations/add_radio_revenue.sql
CREATE TABLE radio_revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES radio_submissions(id),
  placement_type VARCHAR(50) NOT NULL,
  revenue_amount DECIMAL(10,2) NOT NULL,
  service_category VARCHAR(50),
  
  -- Attribution
  user_id UUID REFERENCES auth.users(id),
  campaign_id UUID,
  
  -- Context
  enhanced_context JSONB,
  attribution_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Radio Submission API

```typescript
// packages/app/src/app/api/radio/submit/route.ts
export async function POST(request: Request) {
  const data = await request.json()
  
  // Validate submission data
  const validation = validateRadioSubmission(data)
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.errors }, { status: 400 })
  }
  
  // Create submission record
  const submission = await createRadioSubmission(data)
  
  // Trigger N8N workflow
  await triggerN8NWorkflow('radio-submission-start', {
    submissionId: submission.id,
    userId: data.userId,
    placement_type: 'upload_complete'
  })
  
  return NextResponse.json({ success: true, submission })
}
```

### ISRC Generation API

```typescript
// packages/app/src/app/api/radio/isrc/generate/route.ts
export async function POST(request: Request) {
  const { trackTitle, artistName, userId } = await request.json()
  
  // Generate ISRC via MCP server
  const isrcResult = await mcpClient.generateISRC({
    trackTitle,
    artistName,
    userId,
    territory: 'ZA',
    registrant: '80G'
  })
  
  // Trigger revenue tracking
  await triggerN8NWorkflow('enhanced-radio-placement', {
    placement_type: 'after_isrc_enhanced',
    user_id: userId,
    isrc_generated: true
  })
  
  return NextResponse.json(isrcResult)
}
```

## 📊 Analytics & Reporting

### Radio Analytics Dashboard

```typescript
// packages/app/src/components/radio/RadioAnalyticsDashboard.tsx
export default function RadioAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<RadioAnalytics | null>(null)
  
  useEffect(() => {
    loadRadioAnalytics()
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnalyticsCard 
          title="Total Submissions" 
          value={analytics?.totalSubmissions || 0}
          icon="📻"
        />
        <AnalyticsCard 
          title="Success Rate" 
          value={`${analytics?.successRate || 0}%`}
          icon="✅"
        />
        <AnalyticsCard 
          title="Revenue Generated" 
          value={`R${analytics?.totalRevenue || 0}`}
          icon="💰"
        />
        <AnalyticsCard 
          title="Avg. Per Submission" 
          value={`R${analytics?.avgRevenue || 0}`}
          icon="📈"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlacementRevenueChart data={analytics?.placementRevenue} />
        <SubmissionTrendsChart data={analytics?.submissionTrends} />
      </div>
      
      <RecentSubmissionsTable submissions={analytics?.recentSubmissions} />
    </div>
  )
}
```

## 🚀 Implementation Roadmap

### Phase 1: Core Infrastructure (Weeks 1-2)
- [ ] Audio analysis library integration
- [ ] ISRC manager implementation
- [ ] Database schema setup
- [ ] MCP server endpoints
- [ ] Basic UI components

### Phase 2: Radio Workflow (Weeks 3-4)
- [ ] Radio submission wizard
- [ ] Splitsheet management
- [ ] SAMRO integration
- [ ] Package generation
- [ ] Download system

### Phase 3: Sponsored Content (Weeks 5-6)
- [ ] Sponsor placement system
- [ ] Revenue tracking
- [ ] N8N workflow integration
- [ ] Campaign management
- [ ] Analytics dashboard

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Mobile optimization
- [ ] Performance monitoring
- [ ] Advanced analytics
- [ ] Admin tools
- [ ] Testing & QA

## 🔧 Technical Specifications

### Environment Variables

```bash
# packages/app/.env.local
NEXT_PUBLIC_MCP_SERVER_URL=https://beatschain-mcp-server-production.up.railway.app
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.beatschain.com/webhook
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Radio-specific
RADIO_ISRC_REGISTRANT=80G
RADIO_ISRC_TERRITORY=ZA
RADIO_REVENUE_WEBHOOK=https://n8n.beatschain.com/webhook/enhanced-radio-placement
```

### Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "recharts": "^2.8.0",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0"
  }
}
```

## 🛡️ Security Considerations

### Data Protection
- Sanitize all user inputs
- Validate file uploads
- Encrypt sensitive data
- Secure API endpoints

### Revenue Protection
- Validate placement triggers
- Prevent duplicate revenue events
- Monitor for fraud patterns
- Secure webhook endpoints

### ISRC Security
- Validate ISRC format
- Prevent duplicate generation
- Secure registrant code
- Audit trail logging

## 📈 Performance Metrics

### Key Performance Indicators (KPIs)
- Radio submission completion rate
- Average revenue per submission
- Sponsor placement click-through rate
- ISRC generation success rate
- Package download completion rate

### Monitoring
- Real-time analytics dashboard
- Revenue tracking alerts
- Performance bottleneck detection
- User experience metrics

## 🎯 Success Criteria

### Technical Success
- [ ] 99.9% ISRC generation success rate
- [ ] <3 second audio analysis time
- [ ] Mobile-responsive design
- [ ] Real-time revenue tracking
- [ ] Seamless N8N integration

### Business Success
- [ ] R25+ average revenue per submission
- [ ] 80%+ submission completion rate
- [ ] 15%+ sponsor click-through rate
- [ ] 95%+ user satisfaction score
- [ ] Scalable to 1000+ daily submissions

## 📚 Documentation Requirements

### Developer Documentation
- API endpoint specifications
- Component usage examples
- Database schema documentation
- N8N workflow guides
- Deployment instructions

### User Documentation
- Radio submission guide
- Splitsheet management tutorial
- SAMRO compliance help
- Analytics interpretation
- Troubleshooting guide

---

This comprehensive playbook provides everything needed to implement the complete radio submission system from the Chrome extension into the Next.js app dashboards, maintaining the sophisticated sponsor placement system and revenue generation capabilities while adapting to the app's design protocols and mobile-responsive requirements.