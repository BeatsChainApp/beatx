// Enhanced Onboarding Manager - Public Script
// This is a lightweight version for public access

(function() {
  'use strict';
  
  // Check if already loaded
  if (window.EnhancedOnboardingManager) {
    return;
  }
  
  class EnhancedOnboardingManager {
    constructor() {
      this.initialized = false;
      this.currentStep = 0;
      this.userChoices = {};
      this.steps = ['welcome', 'account', 'role', 'profile', 'features', 'complete'];
    }
    
    async initialize() {
      if (this.initialized) return false;
      
      try {
        // Check if onboarding already completed
        const completed = localStorage.getItem('beatx_enhanced_onboarding_completed');
        if (completed === 'true') {
          return false;
        }
        
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Enhanced onboarding initialization failed:', error);
        return false;
      }
    }
    
    async startOnboarding() {
      console.log('Enhanced onboarding started');
      
      // Create basic onboarding overlay
      this.createOnboardingOverlay();
      
      // Show welcome step
      this.showStep('welcome');
    }
    
    createOnboardingOverlay() {
      const overlay = document.createElement('div');
      overlay.id = 'enhanced-onboarding-overlay';
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(13, 13, 13, 0.95); z-index: 20000;
        display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      const container = document.createElement('div');
      container.id = 'enhanced-onboarding-container';
      container.style.cssText = `
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 16px; padding: 32px; max-width: 600px; width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white; text-align: center;
      `;

      overlay.appendChild(container);
      document.body.appendChild(overlay);
    }
    
    showStep(stepName) {
      const container = document.getElementById('enhanced-onboarding-container');
      if (!container) return;
      
      container.innerHTML = this.getStepContent(stepName);
      this.setupStepListeners(stepName);
    }
    
    getStepContent(stepName) {
      const contents = {
        welcome: `
          <div>
            <div style="font-size: 48px; margin-bottom: 16px;">🎵</div>
            <h2 style="margin: 0 0 8px 0; font-size: 24px;">Welcome to BeatsChain</h2>
            <p style="margin: 0 0 24px 0; opacity: 0.8;">Transform your music into NFTs and build your career</p>
            <button data-action="continue" style="
              background: linear-gradient(135deg, #ff9800, #ff5722);
              color: white; padding: 12px 24px; border: none; border-radius: 6px;
              cursor: pointer; font-weight: 500; margin-right: 12px;
            ">Get Started</button>
            <button data-action="skip" style="
              background: rgba(255, 255, 255, 0.1); color: white;
              padding: 12px 24px; border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 6px; cursor: pointer;
            ">Skip</button>
          </div>
        `
      };
      
      return contents[stepName] || contents.welcome;
    }
    
    setupStepListeners(stepName) {
      const container = document.getElementById('enhanced-onboarding-container');
      
      container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.handleAction(e.target.dataset.action, stepName);
        });
      });
    }
    
    handleAction(action, currentStep) {
      switch (action) {
        case 'continue':
          this.completeOnboarding();
          break;
        case 'skip':
          this.skipOnboarding();
          break;
      }
    }
    
    async completeOnboarding() {
      localStorage.setItem('beatx_enhanced_onboarding_completed', 'true');
      
      const overlay = document.getElementById('enhanced-onboarding-overlay');
      if (overlay) overlay.remove();
      
      // Dispatch completion event
      window.dispatchEvent(new CustomEvent('enhanced-app-onboarding', {
        detail: { 
          type: 'enhanced-complete',
          data: { userChoices: this.userChoices }
        }
      }));
    }
    
    async skipOnboarding() {
      localStorage.setItem('beatx_enhanced_onboarding_completed', 'true');
      
      const overlay = document.getElementById('enhanced-onboarding-overlay');
      if (overlay) overlay.remove();
    }
  }
  
  // Export to window
  window.EnhancedOnboardingManager = EnhancedOnboardingManager;
  
  console.log('Enhanced Onboarding Manager loaded');
})();