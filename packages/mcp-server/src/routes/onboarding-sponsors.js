/**
 * Onboarding Sponsor Content API Routes
 * Extension vs App context-aware sponsor delivery
 */

const express = require('express');
const router = express.Router();

// Extension-specific sponsor categories
const extensionSponsorCategories = {
  partner_ecosystem: {
    title: "Professional Music Partners",
    message: "Powered by industry-leading music services",
    icon: "🤝",
    timing: "immediate"
  },
  professional_services: {
    title: "Professional Services",
    message: "Access industry-standard tools after sign-in",
    icon: "⚡",
    timing: "after_signin"
  },
  individual_artist_tools: {
    title: "Solo Artist Toolkit",
    message: "Tools designed for independent artists",
    icon: "🎤",
    timing: "role_specific"
  },
  isrc_services: {
    title: "ISRC Registration Services",
    message: "Professional ISRC registration and management",
    icon: "🎯",
    timing: "feature_specific"
  },
  radio_submission: {
    title: "SA Radio Services",
    message: "Enhanced radio submission and plugging",
    icon: "📻",
    timing: "feature_specific"
  },
  legal_services: {
    title: "Music Legal Services",
    message: "Professional legal consultation for artists",
    icon: "⚖️",
    timing: "feature_specific"
  },
  profile_services: {
    title: "Profile Optimization",
    message: "Professional artist profile enhancement",
    icon: "📝",
    timing: "profile_setup"
  }
};

// App-specific sponsor categories (different from extension)
const appSponsorCategories = {
  marketplace_services: {
    title: "Marketplace Enhancement",
    message: "Boost your BeatNFT marketplace presence",
    icon: "🏪",
    timing: "marketplace_focus"
  },
  producer_tools: {
    title: "Producer Suite",
    message: "Advanced tools for beat makers and producers",
    icon: "🎹",
    timing: "producer_specific"
  },
  collaboration_services: {
    title: "Collaboration Platform",
    message: "Connect with artists and expand your network",
    icon: "🤝",
    timing: "networking_focus"
  },
  analytics_services: {
    title: "Advanced Analytics",
    message: "Track performance and optimize earnings",
    icon: "📊",
    timing: "performance_focus"
  }
};

// Get onboarding sponsors for specific step
router.get('/sponsors/onboarding/:step', async (req, res) => {
  try {
    const { step } = req.params;
    const { role, context = 'extension', consentGiven } = req.query;

    // Check consent
    if (consentGiven !== 'true') {
      return res.json({ sponsors: [], message: 'Consent required' });
    }

    // Get context-specific categories
    const categories = context === 'extension' ? extensionSponsorCategories : appSponsorCategories;
    
    // Step-specific sponsor mapping
    const stepSponsors = {
      extension: {
        welcome: ['partner_ecosystem'],
        account: ['professional_services'],
        role: getRoleSpecificSponsors(role, 'extension'),
        profile: ['profile_services'],
        features: ['isrc_services', 'radio_submission', 'legal_services']
      },
      app: {
        welcome: ['marketplace_services'],
        account: ['producer_tools'],
        role: getRoleSpecificSponsors(role, 'app'),
        profile: ['collaboration_services'],
        features: ['analytics_services', 'marketplace_services']
      }
    };

    const sponsorKeys = stepSponsors[context]?.[step] || [];
    const sponsors = sponsorKeys.map(key => ({
      id: key,
      ...categories[key],
      context: context,
      step: step
    }));

    res.json({
      sponsors,
      step,
      context,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get onboarding sponsors error:', error);
    res.status(500).json({ error: 'Failed to get sponsors' });
  }
});

// Get role-specific sponsors
router.get('/sponsors/role-specific', async (req, res) => {
  try {
    const { role, context = 'extension' } = req.query;
    
    const roleSponsors = {
      extension: {
        solo_artist: ['individual_artist_tools', 'isrc_services'],
        producer: ['individual_artist_tools', 'legal_services'],
        both: ['individual_artist_tools', 'isrc_services', 'legal_services']
      },
      app: {
        producer: ['producer_tools', 'marketplace_services'],
        label: ['collaboration_services', 'analytics_services'],
        both: ['producer_tools', 'marketplace_services', 'analytics_services']
      }
    };

    const categories = context === 'extension' ? extensionSponsorCategories : appSponsorCategories;
    const sponsorKeys = roleSponsors[context]?.[role] || [];
    
    const sponsors = sponsorKeys.map(key => ({
      id: key,
      ...categories[key],
      context: context,
      role: role
    }));

    res.json({ sponsors, role, context });

  } catch (error) {
    console.error('Get role-specific sponsors error:', error);
    res.status(500).json({ error: 'Failed to get role sponsors' });
  }
});

// Track onboarding sponsor interactions
router.post('/sponsors/onboarding/interaction', async (req, res) => {
  try {
    const { userId, sponsorId, action, step, context } = req.body;

    // Store interaction for analytics
    const interaction = {
      userId,
      sponsorId,
      action, // 'shown', 'clicked', 'dismissed'
      step,
      context,
      timestamp: new Date().toISOString()
    };

    // In production, store to database
    console.log('Onboarding sponsor interaction:', interaction);

    res.json({ success: true, interaction });

  } catch (error) {
    console.error('Track sponsor interaction error:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

// Get onboarding analytics (admin only)
router.get('/sponsors/onboarding/analytics', async (req, res) => {
  try {
    const { context, timeRange = '7d' } = req.query;

    // Mock analytics data
    const analytics = {
      context,
      timeRange,
      totalOnboardings: 150,
      sponsorImpressions: 420,
      sponsorClicks: 45,
      clickThroughRate: '10.7%',
      topSponsors: context === 'extension' ? [
        { id: 'isrc_services', impressions: 120, clicks: 15 },
        { id: 'radio_submission', impressions: 100, clicks: 12 },
        { id: 'legal_services', impressions: 80, clicks: 8 }
      ] : [
        { id: 'marketplace_services', impressions: 90, clicks: 18 },
        { id: 'producer_tools', impressions: 85, clicks: 14 },
        { id: 'analytics_services', impressions: 70, clicks: 10 }
      ],
      byStep: {
        welcome: { impressions: 150, clicks: 12 },
        account: { impressions: 120, clicks: 15 },
        role: { impressions: 100, clicks: 18 },
        profile: { impressions: 80, clicks: 8 },
        features: { impressions: 90, clicks: 12 }
      }
    };

    res.json(analytics);

  } catch (error) {
    console.error('Get onboarding analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

function getRoleSpecificSponsors(role, context) {
  const mapping = {
    extension: {
      solo_artist: ['individual_artist_tools'],
      producer: ['individual_artist_tools'],
      both: ['individual_artist_tools']
    },
    app: {
      producer: ['producer_tools'],
      label: ['collaboration_services'],
      both: ['producer_tools', 'collaboration_services']
    }
  };

  return mapping[context]?.[role] || [];
}

module.exports = router;