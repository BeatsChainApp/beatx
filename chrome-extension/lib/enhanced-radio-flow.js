/**
 * Enhanced Radio Flow - Adds Splitsheet and Sponsored Content Steps
 * Preserves existing system design with minimal breaking changes
 */

class EnhancedRadioFlow {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            'upload',           // 0 - Existing
            'metadata',         // 1 - Existing  
            'splitsheets',      // 2 - NEW
            'samro',           // 3 - NEW
            'isrc',            // 4 - Enhanced existing
            'signatures',      // 5 - NEW - Digital/Manual signatures
            'package',         // 6 - Existing
            'download'         // 7 - Existing
        ];
        this.stepData = {};
        this.sponsorPlacements = new Map();
    }

    async initialize(app) {
        this.app = app;
        
        // Preserve existing radio functionality
        this.preserveExistingFlow(app);
        
        // Add new splitsheet step
        this.addSplitsheetStep(app);
        
        // Add new SAMRO step  
        this.addSAMROStep(app);
        
        // Add signature step
        this.addSignatureStep(app);
        
        // Enhance sponsor placements
        this.enhanceSponsorPlacements(app);
        
        console.log('✅ Enhanced Radio Flow initialized - preserving existing system');
    }

    preserveExistingFlow(app) {
        // Store original methods to preserve functionality
        this.originalMethods = {
            processRadioFile: app.processRadioFile,
            validateForRadio: app.validateForRadio,
            generateRadioPackage: app.generateRadioPackage
        };
        
        // Enhance existing methods without breaking changes
        this.enhanceExistingMethods(app);
    }

    enhanceExistingMethods(app) {
        // Enhance processRadioFile to include splitsheet check
        app.processRadioFile = async (file) => {
            const result = await this.originalMethods.processRadioFile.call(app, file);
            
            if (result !== false) {
                // Auto-advance to splitsheet step after successful upload
                this.currentStep = 2; // splitsheets
                this.showSplitsheetStep();
            }
            
            return result;
        };

        // Enhance validateForRadio to include new validations
        app.validateForRadio = async () => {
            const originalResult = await this.originalMethods.validateForRadio.call(app);
            
            if (originalResult) {
                // Additional validation for new steps
                const splitsheetValid = await this.validateSplitsheets();
                const samroValid = await this.validateSAMRO();
                
                return originalResult && splitsheetValid && samroValid;
            }
            
            return originalResult;
        };

        // Enhance generateRadioPackage to include new components
        app.generateRadioPackage = async () => {
            // Include splitsheet, SAMRO, and signature data in package
            await this.prepareSplitsheetData();
            await this.prepareSAMROData();
            await this.prepareSignatureData();
            
            const result = await this.originalMethods.generateRadioPackage.call(app);
            
            if (result) {
                // Add new components to package
                result.splitsheets = this.stepData.splitsheets;
                result.samroDocumentation = this.stepData.samro;
                result.signatures = this.stepData.signatures;
            }
            
            return result;
        };
    }

    addSplitsheetStep(app) {
        // Create splitsheet management interface
        const splitsheetHTML = `
            <div id="radio-splitsheet-step" class="radio-step" style="display: none;">
                <div class="step-header">
                    <h3>📊 Splitsheet Management</h3>
                    <p>Define contributor splits for radio submission</p>
                </div>
                
                <div class="splitsheet-form">
                    <div class="contributors-section">
                        <h4>Contributors</h4>
                        <div id="contributors-list"></div>
                        <button type="button" id="add-contributor" class="btn btn-secondary">
                            + Add Contributor
                        </button>
                    </div>
                    
                    <div class="validation-section">
                        <div class="total-percentage">
                            Total: <span id="total-percentage">0</span>%
                        </div>
                        <div class="validation-status" id="splitsheet-validation"></div>
                    </div>
                </div>
                
                <div class="step-actions">
                    <button type="button" id="skip-splitsheets" class="btn btn-secondary">
                        Skip (Use Default)
                    </button>
                    <button type="button" id="save-splitsheets" class="btn btn-primary" disabled>
                        Save Splitsheets
                    </button>
                </div>
            </div>
        `;
        
        // Insert after metadata step
        const metadataStep = document.getElementById('radio-metadata-display');
        if (metadataStep) {
            metadataStep.insertAdjacentHTML('afterend', splitsheetHTML);
            this.setupSplitsheetEvents();
        }
    }

    addSAMROStep(app) {
        // Create SAMRO documentation interface
        const samroHTML = `
            <div id="radio-samro-step" class="radio-step" style="display: none;">
                <div class="step-header">
                    <h3>🏛️ SAMRO Documentation</h3>
                    <p>Generate official SAMRO compliance documents</p>
                </div>
                
                <div class="samro-form">
                    <div class="samro-info">
                        <h4>SAMRO Registration Details</h4>
                        <div class="form-row">
                            <label for="samro-member-number">SAMRO Member Number (Optional)</label>
                            <input type="text" id="samro-member-number" placeholder="e.g., 123456789">
                        </div>
                        <div class="form-row">
                            <label for="samro-work-title">Work Title</label>
                            <input type="text" id="samro-work-title" readonly>
                        </div>
                    </div>
                    
                    <div class="samro-preview">
                        <h4>Document Preview</h4>
                        <div id="samro-document-preview" class="document-preview">
                            <p>SAMRO Composer Split Confirmation will be generated...</p>
                        </div>
                    </div>
                </div>
                
                <div class="step-actions">
                    <button type="button" id="skip-samro" class="btn btn-secondary">
                        Skip SAMRO
                    </button>
                    <button type="button" id="generate-samro" class="btn btn-primary">
                        Generate SAMRO Documents
                    </button>
                </div>
            </div>
        `;
        
        // Insert after splitsheet step
        const splitsheetStep = document.getElementById('radio-splitsheet-step');
        if (splitsheetStep) {
            splitsheetStep.insertAdjacentHTML('afterend', samroHTML);
            this.setupSAMROEvents();
        }
    }

    enhanceSponsorPlacements(app) {
        // Add new sponsor placements for enhanced flow
        const newPlacements = [
            {
                step: 'splitsheets',
                placement: 'after_splitsheet_entry',
                timer: 1000,
                revenue: 3.50,
                service: 'Legal Protection Services'
            },
            {
                step: 'samro',
                placement: 'after_samro_generation',
                timer: 1200,
                revenue: 4.00,
                service: 'Compliance & Documentation'
            },
            {
                step: 'isrc',
                placement: 'after_isrc_enhanced',
                timer: 800,
                revenue: 2.50,
                service: 'Professional ISRC Services'
            }
        ];

        newPlacements.forEach(placement => {
            this.sponsorPlacements.set(placement.step, placement);
        });

        // Integrate with existing RadioSponsorIntegration
        if (app.radioSponsorIntegration) {
            this.enhanceExistingSponsorIntegration(app.radioSponsorIntegration);
        }
    }

    enhanceExistingSponsorIntegration(sponsorIntegration) {
        // Add new placement handlers to existing system
        const originalDisplaySponsorContent = sponsorIntegration.displaySponsorContent;
        
        sponsorIntegration.displaySponsorContent = async (placement, container, context = {}) => {
            // Handle new placements
            if (placement === 'after_splitsheet_entry') {
                await this.displaySplitsheetSponsor(container, context);
                return;
            }
            
            if (placement === 'after_samro_generation') {
                await this.displaySAMROSponsor(container, context);
                return;
            }
            
            // Fallback to original method
            return await originalDisplaySponsorContent.call(sponsorIntegration, placement, container, context);
        };
    }

    setupSplitsheetEvents() {
        // Add contributor button
        document.getElementById('add-contributor')?.addEventListener('click', () => {
            this.addContributor();
        });

        // Skip splitsheets button
        document.getElementById('skip-splitsheets')?.addEventListener('click', () => {
            this.skipSplitsheets();
        });

        // Save splitsheets button
        document.getElementById('save-splitsheets')?.addEventListener('click', () => {
            this.saveSplitsheets();
        });
    }

    setupSAMROEvents() {
        // Skip SAMRO button
        document.getElementById('skip-samro')?.addEventListener('click', () => {
            this.skipSAMRO();
        });

        // Generate SAMRO button
        document.getElementById('generate-samro')?.addEventListener('click', () => {
            this.generateSAMRO();
        });

        // Auto-populate work title from metadata
        const workTitleField = document.getElementById('samro-work-title');
        if (workTitleField && this.app.radioMetadata?.title) {
            workTitleField.value = this.app.radioMetadata.title;
        }
    }

    showSplitsheetStep() {
        // Hide other steps
        document.querySelectorAll('.radio-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show splitsheet step
        const splitsheetStep = document.getElementById('radio-splitsheet-step');
        if (splitsheetStep) {
            splitsheetStep.style.display = 'block';
            this.initializeDefaultContributor();
        }
    }

    initializeDefaultContributor() {
        // Add default contributor based on metadata
        const artistName = this.app.radioMetadata?.artist || 'Unknown Artist';
        this.addContributor({
            name: artistName,
            role: 'songwriter',
            percentage: 100,
            idNumber: '', // User must fill
            samroNumber: ''
        });
    }

    addContributor(data = {}) {
        const contributorsList = document.getElementById('contributors-list');
        const contributorId = `contributor-${Date.now()}`;
        
        const contributorHTML = `
            <div class="contributor-item" data-id="${contributorId}">
                <div class="contributor-fields">
                    <input type="text" class="contributor-name" placeholder="Full Legal Name" 
                           value="${data.name || ''}" required>
                    <select class="contributor-role">
                        <option value="songwriter" ${data.role === 'songwriter' ? 'selected' : ''}>Songwriter</option>
                        <option value="producer" ${data.role === 'producer' ? 'selected' : ''}>Producer</option>
                        <option value="artist" ${data.role === 'artist' ? 'selected' : ''}>Artist</option>
                        <option value="vocalist" ${data.role === 'vocalist' ? 'selected' : ''}>Vocalist</option>
                    </select>
                    <input type="text" class="contributor-id-number" placeholder="ID/Passport Number" 
                           value="${data.idNumber || ''}" required 
                           pattern="[0-9]{13}|[A-Z0-9]{6,9}" 
                           title="SA ID (13 digits) or Passport (6-9 chars)">
                    <input type="number" class="contributor-percentage" placeholder="%" 
                           min="0" max="100" value="${data.percentage || 0}" required>
                    <button type="button" class="remove-contributor">×</button>
                </div>
                <div class="contributor-samro">
                    <input type="text" class="contributor-samro-number" placeholder="SAMRO Member # (Optional)" 
                           value="${data.samroNumber || ''}">
                </div>
            </div>
        `;
        
        contributorsList.insertAdjacentHTML('beforeend', contributorHTML);
        
        // Add event listeners
        const contributorItem = contributorsList.lastElementChild;
        this.setupContributorEvents(contributorItem);
        
        // Update validation
        this.validateSplitsheets();
    }

    setupContributorEvents(contributorItem) {
        // Remove contributor
        contributorItem.querySelector('.remove-contributor')?.addEventListener('click', () => {
            contributorItem.remove();
            this.validateSplitsheets();
        });

        // Validate on change
        contributorItem.querySelectorAll('input, select').forEach(field => {
            field.addEventListener('input', () => {
                this.validateSplitsheets();
            });
        });
    }

    async validateSplitsheets() {
        const contributors = this.getContributors();
        const totalPercentage = contributors.reduce((sum, c) => sum + (c.percentage || 0), 0);
        
        // Update total display
        const totalDisplay = document.getElementById('total-percentage');
        if (totalDisplay) {
            totalDisplay.textContent = totalPercentage;
            totalDisplay.style.color = totalPercentage === 100 ? 'var(--bc-accent-green)' : 'var(--bc-error)';
        }
        
        // Enhanced validation with ID numbers
        const validationStatus = document.getElementById('splitsheet-validation');
        const saveButton = document.getElementById('save-splitsheets');
        
        const validationErrors = [];
        
        // Check percentage total
        if (Math.abs(totalPercentage - 100) > 0.01) {
            validationErrors.push('Total must equal 100%');
        }
        
        // Check required fields including ID numbers
        contributors.forEach((c, i) => {
            if (!c.name?.trim()) validationErrors.push(`Contributor ${i+1}: Name required`);
            if (!c.idNumber?.trim()) validationErrors.push(`Contributor ${i+1}: ID/Passport required`);
            if (!c.percentage || c.percentage <= 0) validationErrors.push(`Contributor ${i+1}: Valid percentage required`);
            
            // Validate ID format (SA ID or Passport)
            if (c.idNumber?.trim()) {
                const saIdPattern = /^[0-9]{13}$/;
                const passportPattern = /^[A-Z0-9]{6,9}$/;
                if (!saIdPattern.test(c.idNumber) && !passportPattern.test(c.idNumber)) {
                    validationErrors.push(`Contributor ${i+1}: Invalid ID format`);
                }
            }
        });
        
        const isValid = validationErrors.length === 0 && contributors.length > 0;
        
        if (validationStatus) {
            validationStatus.innerHTML = isValid ? 
                '✅ Splitsheets valid - Ready for SAMRO compliance' : 
                `❌ ${validationErrors.join(', ')}`;
            validationStatus.className = `validation-status ${isValid ? 'valid' : 'invalid'}`;
        }
        
        if (saveButton) {
            saveButton.disabled = !isValid;
        }
        
        return isValid;
    }

    getContributors() {
        const contributorItems = document.querySelectorAll('.contributor-item');
        return Array.from(contributorItems).map(item => ({
            name: item.querySelector('.contributor-name')?.value || '',
            role: item.querySelector('.contributor-role')?.value || 'songwriter',
            idNumber: item.querySelector('.contributor-id-number')?.value || '',
            samroNumber: item.querySelector('.contributor-samro-number')?.value || '',
            percentage: parseFloat(item.querySelector('.contributor-percentage')?.value) || 0
        }));
    }

    async saveSplitsheets() {
        const contributors = this.getContributors();
        
        if (await this.validateSplitsheets()) {
            this.stepData.splitsheets = {
                contributors,
                createdAt: new Date().toISOString(),
                createdBy: 'BeatsChain Chrome Extension Enhanced Radio Flow'
            };
            
            // Show sponsor content after splitsheet completion
            setTimeout(() => {
                this.displaySplitsheetSponsor();
            }, 1000);
            
            // Advance to SAMRO step
            setTimeout(() => {
                this.showSAMROStep();
            }, 3000);
        }
    }

    skipSplitsheets() {
        // Use default 100% to main artist
        const artistName = this.app.radioMetadata?.artist || 'Unknown Artist';
        this.stepData.splitsheets = {
            contributors: [{
                name: artistName,
                role: 'songwriter',
                percentage: 100
            }],
            skipped: true,
            createdAt: new Date().toISOString(),
            createdBy: 'BeatsChain Chrome Extension Enhanced Radio Flow'
        };
        
        this.showSAMROStep();
    }

    showSAMROStep() {
        // Hide other steps
        document.querySelectorAll('.radio-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show SAMRO step
        const samroStep = document.getElementById('radio-samro-step');
        if (samroStep) {
            samroStep.style.display = 'block';
            this.updateSAMROPreview();
        }
    }

    updateSAMROPreview() {
        const preview = document.getElementById('samro-document-preview');
        const contributors = this.stepData.splitsheets?.contributors || [];
        
        if (preview) {
            preview.innerHTML = `
                <div class="samro-preview-content">
                    <h5>SAMRO Composer Split Confirmation</h5>
                    <p><strong>Work Title:</strong> ${this.app.radioMetadata?.title || 'Unknown'}</p>
                    <p><strong>Contributors:</strong></p>
                    <ul>
                        ${contributors.map(c => 
                            `<li>${c.name} - ${c.role} (${c.percentage}%)</li>`
                        ).join('')}
                    </ul>
                    <p><em>Official SAMRO PDF will be generated with completion instructions.</em></p>
                </div>
            `;
        }
    }

    async generateSAMRO() {
        try {
            // Use existing SAMRO PDF Manager
            if (window.SAMROPDFManager) {
                const samroManager = new SAMROPDFManager();
                await samroManager.initialize();
                
                const userData = {
                    trackTitle: this.app.radioMetadata?.title,
                    artistName: this.app.radioMetadata?.artist
                };
                
                const contributorsData = this.stepData.splitsheets?.contributors || [];
                
                const samroPackage = await samroManager.createSAMROPackage(userData, contributorsData);
                
                this.stepData.samro = {
                    package: samroPackage,
                    memberNumber: document.getElementById('samro-member-number')?.value || '',
                    createdAt: new Date().toISOString(),
                    createdBy: 'BeatsChain Chrome Extension Enhanced Radio Flow'
                };
                
                // Show sponsor content after SAMRO generation
                setTimeout(() => {
                    this.displaySAMROSponsor();
                }, 1200);
                
                // Advance to signature step
                setTimeout(() => {
                    this.showSignatureStep();
                }, 4000);
                
            } else {
                throw new Error('SAMRO PDF Manager not available');
            }
        } catch (error) {
            console.error('SAMRO generation failed:', error);
            alert('SAMRO generation failed. Continuing without SAMRO documentation.');
            this.skipSAMRO();
        }
    }

    skipSAMRO() {
        this.stepData.samro = {
            skipped: true,
            reason: 'User skipped SAMRO documentation',
            createdAt: new Date().toISOString(),
            createdBy: 'BeatsChain Chrome Extension Enhanced Radio Flow'
        };
        
        this.showSignatureStep();
    }

    addSignatureStep(app) {
        // Initialize signature manager
        if (window.SignatureManager) {
            this.signatureManager = window.SignatureManager.enhanceRadioFlow(this);
            this.signatureManager.addSignatureStep();
        }
    }

    showSignatureStep() {
        if (this.signatureManager) {
            this.signatureManager.showSignatureStep();
        } else {
            // Fallback to ISRC if signature manager not available
            this.showISRCStep();
        }
    }

    showISRCStep() {
        // Continue with existing ISRC generation
        // This preserves the existing flow
        if (this.app.generateISRC) {
            this.app.generateISRC();
        }
    }

    async prepareSplitsheetData() {
        // Prepare splitsheet data for package inclusion
        if (this.stepData.splitsheets) {
            // Create splitsheet files for radio package
            const splitsheetJSON = {
                ...this.stepData.splitsheets,
                packageComponent: 'splitsheets',
                radioSubmission: true
            };
            
            // Store for package generation
            this.app.radioSplitsheets = splitsheetJSON;
        }
    }

    async prepareSAMROData() {
        // Prepare SAMRO data for package inclusion
        if (this.stepData.samro && !this.stepData.samro.skipped) {
            // Store SAMRO package for inclusion
            this.app.radioSAMROPackage = this.stepData.samro.package;
        }
    }

    async prepareSignatureData() {
        // Prepare signature data for package inclusion
        const signatures = this.app.radioSignatures || JSON.parse(localStorage.getItem('radio-signatures') || '{}');
        
        if (signatures && !signatures.skipped) {
            this.stepData.signatures = {
                ...signatures,
                packageComponent: 'signatures',
                radioSubmission: true,
                preparedAt: new Date().toISOString()
            };
            
            // Store for package generation
            this.app.radioSignaturePackage = this.stepData.signatures;
        }
    }

    async displaySplitsheetSponsor(container, context = {}) {
        const sponsorContainer = container || document.getElementById('radio-splitsheet-step');
        if (!sponsorContainer) return;

        const sponsorHTML = `
            <div class="sponsor-content splitsheet-sponsor">
                <div class="sponsor-header">
                    <span class="sponsor-label">⚖️ Legal Services</span>
                    <button class="sponsor-close">×</button>
                </div>
                <div class="sponsor-body">
                    <h4>Music Legal Protection Services</h4>
                    <p>Professional legal review and copyright protection for your radio submissions.</p>
                    <a href="https://musiclegal.co.za" target="_blank" class="sponsor-link">
                        Protect Your Music →
                    </a>
                </div>
            </div>
        `;
        
        sponsorContainer.insertAdjacentHTML('beforeend', sponsorHTML);
        
        // Track sponsor display
        this.trackSponsorEvent('impression', 'after_splitsheet_entry', 3.50);
    }

    async displaySAMROSponsor(container, context = {}) {
        const sponsorContainer = container || document.getElementById('radio-samro-step');
        if (!sponsorContainer) return;

        const sponsorHTML = `
            <div class="sponsor-content samro-sponsor">
                <div class="sponsor-header">
                    <span class="sponsor-label">🏛️ Compliance Services</span>
                    <button class="sponsor-close">×</button>
                </div>
                <div class="sponsor-body">
                    <h4>SAMRO Compliance Pro</h4>
                    <p>Expert SAMRO documentation and compliance services for South African radio.</p>
                    <a href="https://samrocompliance.co.za" target="_blank" class="sponsor-link">
                        Get Expert Help →
                    </a>
                </div>
            </div>
        `;
        
        sponsorContainer.insertAdjacentHTML('beforeend', sponsorHTML);
        
        // Track sponsor display
        this.trackSponsorEvent('impression', 'after_samro_generation', 4.00);
    }

    async trackSponsorEvent(action, placement, revenue) {
        // Integrate with existing N8N workflow system
        try {
            const eventData = {
                placement_type: placement,
                action: action,
                revenue: revenue,
                user_id: await this.getCurrentUserId(),
                timestamp: new Date().toISOString(),
                context: 'enhanced_radio_flow'
            };

            // Send to MCP server (existing endpoint)
            const mcpUrl = 'https://beatschain-mcp-server-production.up.railway.app';
            await fetch(`${mcpUrl}/api/campaigns/track-revenue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            console.log(`📊 Enhanced radio sponsor ${action}:`, placement, revenue);
        } catch (error) {
            console.warn('Sponsor tracking failed:', error);
        }
    }

    async getCurrentUserId() {
        // Get current user ID (existing method)
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                return accounts[0] || 'anonymous';
            } catch (error) {
                return 'anonymous';
            }
        }
        return 'anonymous';
    }

    // Static integration method
    static enhanceApp(app) {
        const enhancedFlow = new EnhancedRadioFlow();
        app.enhancedRadioFlow = enhancedFlow;
        
        // Initialize when app is ready
        if (app.isInitialized) {
            enhancedFlow.initialize(app);
        } else {
            const checkInit = setInterval(() => {
                if (app.isInitialized) {
                    clearInterval(checkInit);
                    enhancedFlow.initialize(app);
                }
            }, 100);
        }

        return enhancedFlow;
    }
}

window.EnhancedRadioFlow = EnhancedRadioFlow;