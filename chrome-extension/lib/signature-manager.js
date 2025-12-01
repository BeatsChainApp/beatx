/**
 * Signature Manager - Digital & Manual Signature Support
 * Final step before package generation
 */

class SignatureManager {
    constructor() {
        this.signatures = new Map();
        this.signatureMode = 'manual';
        this.mcpServerUrl = 'https://beatschain-mcp-server-production.up.railway.app';
        this.n8nWebhookUrl = 'https://n8n.beatschain.com/webhook/radio-signature-request';
    }

    // Add signature step to enhanced radio flow
    addSignatureStep() {
        const signatureHTML = `
            <div id="radio-signature-step" class="radio-step" style="display: none;">
                <div class="step-header">
                    <h3>✍️ Signature Confirmation</h3>
                    <p>Final step: Sign the SAMRO documentation</p>
                </div>
                
                <div class="signature-options">
                    <div class="signature-mode-selector">
                        <label>
                            <input type="radio" name="signature-mode" value="docusign">
                            🏢 DocuSign Professional (Recommended)
                        </label>
                        <label>
                            <input type="radio" name="signature-mode" value="digital" checked>
                            ✍️ Digital Signature (Sign Now)
                        </label>
                        <label>
                            <input type="radio" name="signature-mode" value="manual">
                            📄 Manual Signature (Export & Sign Later)
                        </label>
                    </div>
                    
                    <div id="digital-signature-section" class="signature-section">
                        <div id="contributors-signature-list"></div>
                    </div>
                    
                    <div id="manual-signature-section" class="signature-section" style="display: none;">
                        <div class="manual-info">
                            <p>📄 Documents will be exported for manual signing</p>
                            <p>✅ All contributors must sign before radio submission</p>
                        </div>
                    </div>
                </div>
                
                <div class="step-actions">
                    <button type="button" id="skip-signatures" class="btn btn-secondary">
                        Skip Signatures
                    </button>
                    <button type="button" id="complete-signatures" class="btn btn-primary">
                        Complete & Generate Package
                    </button>
                </div>
            </div>
        `;
        
        // Insert before package step
        const samroStep = document.getElementById('radio-samro-step');
        if (samroStep) {
            samroStep.insertAdjacentHTML('afterend', signatureHTML);
            this.setupSignatureEvents();
        }
    }

    setupSignatureEvents() {
        // Mode selector
        document.querySelectorAll('input[name="signature-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.signatureMode = e.target.value;
                this.toggleSignatureMode();
            });
        });

        // Complete signatures
        document.getElementById('complete-signatures')?.addEventListener('click', () => {
            this.completeSignatures();
        });

        // Skip signatures
        document.getElementById('skip-signatures')?.addEventListener('click', () => {
            this.skipSignatures();
        });
    }

    toggleSignatureMode() {
        const digitalSection = document.getElementById('digital-signature-section');
        const manualSection = document.getElementById('manual-signature-section');
        
        if (this.signatureMode === 'digital') {
            digitalSection.style.display = 'block';
            manualSection.style.display = 'none';
            this.renderDigitalSignatures();
        } else {
            digitalSection.style.display = 'none';
            manualSection.style.display = 'block';
        }
    }

    renderDigitalSignatures() {
        const container = document.getElementById('contributors-signature-list');
        const contributors = this.getContributors();
        
        container.innerHTML = contributors.map((contributor, index) => `
            <div class="contributor-signature" data-index="${index}">
                <div class="contributor-info">
                    <strong>${contributor.name}</strong> (${contributor.role} - ${contributor.percentage}%)
                </div>
                <div class="signature-pad-container">
                    <canvas id="signature-pad-${index}" class="signature-pad" width="300" height="100"></canvas>
                    <div class="signature-controls">
                        <button type="button" class="clear-signature" data-index="${index}">Clear</button>
                        <span class="signature-status" id="status-${index}">Not Signed</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Initialize signature pads
        this.initializeSignaturePads(contributors.length);
    }

    initializeSignaturePads(count) {
        for (let i = 0; i < count; i++) {
            const canvas = document.getElementById(`signature-pad-${i}`);
            if (canvas) {
                const signaturePad = new SignaturePad(canvas);
                
                // Store signature pad reference
                this.signatures.set(i, {
                    pad: signaturePad,
                    signed: false
                });

                // Clear button
                document.querySelector(`[data-index="${i}"].clear-signature`)?.addEventListener('click', () => {
                    signaturePad.clear();
                    this.signatures.get(i).signed = false;
                    document.getElementById(`status-${i}`).textContent = 'Not Signed';
                });

                // Track signing
                signaturePad.addEventListener('endStroke', () => {
                    this.signatures.get(i).signed = true;
                    document.getElementById(`status-${i}`).textContent = '✅ Signed';
                });
            }
        }
    }

    async completeSignatures() {
        const contributors = this.getContributors();
        const trackData = this.getTrackData();
        
        if (this.signatureMode === 'docusign') {
            return await this.processDocuSignWorkflow(contributors, trackData);
        } else if (this.signatureMode === 'digital') {
            return await this.processEnhancedDigitalSignatures(contributors, trackData);
        } else {
            return await this.processManualSignatures();
        }
    }

    async processDigitalSignatures() {
        const contributors = this.getContributors();
        const signatureData = [];

        // Validate all signatures
        for (let i = 0; i < contributors.length; i++) {
            const signature = this.signatures.get(i);
            if (!signature || !signature.signed || signature.pad.isEmpty()) {
                alert(`Please sign for ${contributors[i].name}`);
                return false;
            }

            signatureData.push({
                contributor: contributors[i],
                signature: signature.pad.toDataURL(),
                timestamp: new Date().toISOString()
            });
        }

        // Store signatures and proceed
        this.storeSignatures(signatureData);
        this.proceedToPackageGeneration();
        return true;
    }

    async processManualSignatures() {
        // Generate documents for manual signing
        const contributors = this.getContributors();
        const manualSignatureData = {
            contributors: contributors,
            mode: 'manual',
            exportedAt: new Date().toISOString(),
            instructions: this.generateManualSigningInstructions()
        };

        this.storeSignatures(manualSignatureData);
        this.proceedToPackageGeneration();
        return true;
    }

    generateManualSigningInstructions() {
        return {
            steps: [
                'Print the SAMRO Composer Split Confirmation document',
                'Each contributor must sign in their designated signature area',
                'Scan or photograph the signed document',
                'Include signed document with radio submission package'
            ],
            requirements: [
                'All contributors must sign with legal name matching ID',
                'Signatures must be legible and match ID documents',
                'Date must be filled in when signing'
            ]
        };
    }

    storeSignatures(signatureData) {
        // Store in app context for package generation
        if (this.app) {
            this.app.radioSignatures = signatureData;
        }
        
        // Store locally
        localStorage.setItem('radio-signatures', JSON.stringify(signatureData));
    }

    skipSignatures() {
        const skipData = {
            skipped: true,
            reason: 'User chose to skip signatures',
            timestamp: new Date().toISOString(),
            note: 'Manual signing required before radio submission'
        };
        
        this.storeSignatures(skipData);
        this.proceedToPackageGeneration();
    }

    proceedToPackageGeneration() {
        // Hide signature step
        document.getElementById('radio-signature-step').style.display = 'none';
        
        // Trigger package generation with signatures
        if (this.app && this.app.generateRadioPackage) {
            this.app.generateRadioPackage();
        }
    }

    getContributors() {
        if (this.app && this.app.enhancedRadioFlow) {
            return this.app.enhancedRadioFlow.stepData.splitsheets?.contributors || [];
        }
        return [];
    }

    getTrackData() {
        return {
            title: this.app?.radioMetadata?.title || 'Unknown Track',
            artist: this.app?.radioMetadata?.artist || 'Unknown Artist',
            isrc: this.app?.radioMetadata?.isrc || '',
            submissionId: `radio_${Date.now()}`
        };
    }

    async processDocuSignWorkflow(contributors, trackData) {
        try {
            const response = await fetch(`${this.mcpServerUrl}/api/signatures/radio-process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contributors,
                    trackData,
                    signatureMode: 'docusign'
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showDocuSignInterface(result.signingUrls, result.envelopeId);
                return true;
            }
        } catch (error) {
            console.error('DocuSign workflow failed:', error);
            return await this.processEnhancedDigitalSignatures(contributors, trackData);
        }
    }

    async processEnhancedDigitalSignatures(contributors, trackData) {
        const signatureData = await this.collectDigitalSignatures();
        
        const response = await fetch(`${this.mcpServerUrl}/api/signatures/radio-process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contributors,
                trackData,
                signatureMode: 'digital_enhanced',
                signatures: signatureData
            })
        });

        const result = await response.json();
        
        if (result.success) {
            this.storeEnhancedSignatures(result);
            this.proceedToPackageGeneration();
            return true;
        }
    }

    async collectDigitalSignatures() {
        const signatures = [];
        for (let [index, signature] of this.signatures) {
            if (signature.signed && !signature.pad.isEmpty()) {
                signatures.push({
                    index,
                    dataUrl: signature.pad.toDataURL(),
                    timestamp: new Date().toISOString()
                });
            }
        }
        return signatures;
    }

    showDocuSignInterface(signingUrls, envelopeId) {
        const modal = document.createElement('div');
        modal.className = 'docusign-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;
        
        modal.innerHTML = `
            <div class="docusign-content" style="
                background: white; padding: 24px; border-radius: 12px;
                max-width: 500px; width: 90%;
            ">
                <h3>📝 DocuSign Professional Signatures</h3>
                <p>Legal-grade signatures for SAMRO compliance</p>
                
                <div class="signing-list">
                    ${signingUrls.map((url, i) => `
                        <div style="margin: 12px 0; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                            <strong>${url.signerName}</strong><br>
                            <a href="${url.signingUrl}" target="_blank" 
                               style="color: #0066cc; text-decoration: none;">
                                Sign Document →
                            </a>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                    <button id="check-docusign-status" style="
                        background: #0066cc; color: white; border: none;
                        padding: 10px 20px; border-radius: 6px; cursor: pointer;
                    ">Check Status</button>
                    <button id="close-docusign" style="
                        background: #666; color: white; border: none;
                        padding: 10px 20px; border-radius: 6px; cursor: pointer;
                        margin-left: 10px;
                    ">Continue Without DocuSign</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#check-docusign-status').onclick = () => {
            this.checkDocuSignStatus(envelopeId);
        };
        
        modal.querySelector('#close-docusign').onclick = () => {
            modal.remove();
            this.proceedToPackageGeneration();
        };
    }

    async checkDocuSignStatus(envelopeId) {
        try {
            const response = await fetch(`${this.mcpServerUrl}/api/signatures/status/${envelopeId}`);
            const result = await response.json();
            
            if (result.success && result.status.status === 'completed') {
                document.querySelector('.docusign-modal')?.remove();
                this.proceedToPackageGeneration();
            } else {
                alert('Signatures still pending. Please complete all signatures.');
            }
        } catch (error) {
            console.error('Status check failed:', error);
        }
    }

    storeEnhancedSignatures(signatureData) {
        const enhanced = {
            ...signatureData,
            legalCompliance: true,
            timestamp: new Date().toISOString()
        };
        
        if (this.app) {
            this.app.radioSignatures = enhanced;
        }
        
        localStorage.setItem('radio-signatures', JSON.stringify(enhanced));
    }

    // Integration with enhanced radio flow
    static enhanceRadioFlow(enhancedRadioFlow) {
        const signatureManager = new SignatureManager();
        signatureManager.app = enhancedRadioFlow.app;
        
        // Add signature step to flow
        enhancedRadioFlow.steps.splice(-2, 0, 'signatures'); // Before package step
        
        // Override showISRCStep to go to signatures
        const originalShowISRCStep = enhancedRadioFlow.showISRCStep;
        enhancedRadioFlow.showISRCStep = function() {
            originalShowISRCStep.call(this);
            // After ISRC, show signatures
            setTimeout(() => {
                signatureManager.showSignatureStep();
            }, 2000);
        };

        enhancedRadioFlow.signatureManager = signatureManager;
        return signatureManager;
    }

    showSignatureStep() {
        // Hide other steps
        document.querySelectorAll('.radio-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show signature step
        const signatureStep = document.getElementById('radio-signature-step');
        if (signatureStep) {
            signatureStep.style.display = 'block';
            this.renderDigitalSignatures();
        }
    }
}

// Simple signature pad implementation (fallback if library not available)
class SignaturePad {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drawing = false;
        this.isEmpty = true;
        
        this.setupEvents();
        this.setupCanvas();
    }

    setupCanvas() {
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
    }

    startDrawing(e) {
        this.drawing = true;
        this.isEmpty = false;
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.beginPath();
        this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    draw(e) {
        if (!this.drawing) return;
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        this.ctx.stroke();
    }

    stopDrawing() {
        this.drawing = false;
        if (this.onEndStroke) this.onEndStroke();
    }

    addEventListener(event, callback) {
        if (event === 'endStroke') {
            this.onEndStroke = callback;
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.isEmpty = true;
    }

    toDataURL() {
        return this.canvas.toDataURL();
    }
}

window.SignatureManager = SignatureManager;