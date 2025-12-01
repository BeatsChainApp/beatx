/**
 * Radio Signature Integration - Minimal integration for extension
 */

class RadioSignatureIntegration {
    constructor() {
        this.initialized = false;
    }

    initialize(app) {
        if (this.initialized) return;
        
        this.app = app;
        this.setupSignatureStep();
        this.initialized = true;
        
        console.log('✅ Radio Signature Integration initialized');
    }

    setupSignatureStep() {
        // Integrate with enhanced radio flow
        if (window.EnhancedRadioFlow) {
            const originalShowISRCStep = window.EnhancedRadioFlow.prototype.showISRCStep;
            
            window.EnhancedRadioFlow.prototype.showISRCStep = function() {
                // Call original ISRC step
                if (originalShowISRCStep) {
                    originalShowISRCStep.call(this);
                }
                
                // After ISRC, show signatures
                setTimeout(() => {
                    this.showSignatureStep();
                }, 2000);
            };
        }

        // Add signature step to radio navigation
        this.addSignatureStepToNavigation();
    }

    addSignatureStepToNavigation() {
        // Hook into radio step navigation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'radio-step-5-next') {
                e.preventDefault();
                this.showSignatureStep();
            }
        });
    }

    showSignatureStep() {
        // Hide other steps
        document.querySelectorAll('.radio-step').forEach(step => {
            step.style.display = 'none';
        });

        // Show signature step
        const signatureStep = document.getElementById('radio-step-6');
        if (signatureStep) {
            signatureStep.style.display = 'block';
            this.renderSignatureInterface(signatureStep);
        }

        // Update navigation
        this.updateStepIndicator(6);
    }

    renderSignatureInterface(container) {
        const contributors = this.getContributors();
        
        container.innerHTML = `
            <h4>✍️ Signature Confirmation</h4>
            <p>Final step: Sign the SAMRO documentation</p>
            
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
                    <div id="contributors-signature-list">
                        ${contributors.map((c, i) => `
                            <div class="contributor-signature" data-index="${i}">
                                <div class="contributor-info">
                                    <strong>${c.name}</strong> (${c.role} - ${c.percentage}%)
                                </div>
                                <div class="signature-pad-container">
                                    <canvas id="signature-pad-${i}" class="signature-pad" width="300" height="100"></canvas>
                                    <div class="signature-controls">
                                        <button type="button" class="clear-signature" data-index="${i}">Clear</button>
                                        <span class="signature-status" id="status-${i}">Not Signed</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div id="manual-signature-section" class="signature-section" style="display: none;">
                    <div class="manual-info">
                        <p>📄 Documents will be exported for manual signing</p>
                        <p>✅ All contributors must sign before radio submission</p>
                    </div>
                </div>
            </div>
            
            <div class="step-actions">
                <button type="button" id="radio-step-6-back" class="btn btn-secondary">Back: Split Sheets</button>
                <button type="button" id="skip-signatures" class="btn btn-secondary">Skip Signatures</button>
                <button type="button" id="complete-signatures" class="btn btn-primary">Complete & Generate Package</button>
            </div>
        `;

        this.setupSignatureEvents(container);
    }

    setupSignatureEvents(container) {
        // Mode selector
        container.querySelectorAll('input[name="signature-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleSignatureMode(e.target.value, container);
            });
        });

        // Navigation
        container.querySelector('#radio-step-6-back')?.addEventListener('click', () => {
            this.showStep(5);
        });

        container.querySelector('#skip-signatures')?.addEventListener('click', () => {
            this.skipSignatures();
        });

        container.querySelector('#complete-signatures')?.addEventListener('click', () => {
            this.completeSignatures(container);
        });

        // Initialize signature pads
        this.initializeSignaturePads(container);
    }

    toggleSignatureMode(mode, container) {
        const digitalSection = container.querySelector('#digital-signature-section');
        const manualSection = container.querySelector('#manual-signature-section');
        
        if (mode === 'digital') {
            digitalSection.style.display = 'block';
            manualSection.style.display = 'none';
        } else if (mode === 'manual') {
            digitalSection.style.display = 'none';
            manualSection.style.display = 'block';
        } else if (mode === 'docusign') {
            this.processDocuSignWorkflow();
        }
    }

    async processDocuSignWorkflow() {
        try {
            const contributors = this.getContributors();
            const trackData = this.getTrackData();

            const response = await fetch('https://beatschain-mcp-server-production.up.railway.app/api/signatures/radio-process', {
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
            }
        } catch (error) {
            console.error('DocuSign workflow failed:', error);
            alert('DocuSign unavailable. Please use digital signatures.');
        }
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
            <div style="background: white; padding: 24px; border-radius: 12px; max-width: 500px; width: 90%;">
                <h3>📝 DocuSign Professional Signatures</h3>
                <p>Legal-grade signatures for SAMRO compliance</p>
                
                <div class="signing-list">
                    ${signingUrls.map(url => `
                        <div style="margin: 12px 0; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                            <strong>${url.signerName}</strong><br>
                            <a href="${url.signingUrl}" target="_blank" style="color: #0066cc;">Sign Document →</a>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                    <button id="check-status" style="background: #0066cc; color: white; border: none; padding: 10px 20px; border-radius: 6px;">Check Status</button>
                    <button id="close-modal" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 6px; margin-left: 10px;">Continue</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#close-modal').onclick = () => {
            modal.remove();
            this.proceedToPackageGeneration();
        };
    }

    initializeSignaturePads(container) {
        const contributors = this.getContributors();
        
        contributors.forEach((contributor, i) => {
            const canvas = container.querySelector(`#signature-pad-${i}`);
            if (canvas) {
                const pad = new SimpleSignaturePad(canvas);
                
                container.querySelector(`[data-index="${i}"].clear-signature`)?.addEventListener('click', () => {
                    pad.clear();
                    container.querySelector(`#status-${i}`).textContent = 'Not Signed';
                });

                pad.onSign = () => {
                    container.querySelector(`#status-${i}`).textContent = '✅ Signed';
                };
            }
        });
    }

    async completeSignatures(container) {
        const mode = container.querySelector('input[name="signature-mode"]:checked')?.value;
        
        if (mode === 'digital') {
            const allSigned = this.validateDigitalSignatures(container);
            if (!allSigned) {
                alert('Please complete all signatures');
                return;
            }
        }

        // Store signature data
        const signatureData = {
            mode,
            timestamp: new Date().toISOString(),
            contributors: this.getContributors()
        };

        localStorage.setItem('radio-signatures', JSON.stringify(signatureData));
        
        this.proceedToPackageGeneration();
    }

    validateDigitalSignatures(container) {
        const contributors = this.getContributors();
        return contributors.every((_, i) => {
            const status = container.querySelector(`#status-${i}`)?.textContent;
            return status === '✅ Signed';
        });
    }

    skipSignatures() {
        const skipData = {
            skipped: true,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('radio-signatures', JSON.stringify(skipData));
        this.proceedToPackageGeneration();
    }

    proceedToPackageGeneration() {
        this.showStep(7); // Package generation step
    }

    showStep(stepNumber) {
        document.querySelectorAll('.radio-step').forEach(step => {
            step.style.display = 'none';
        });
        
        const targetStep = document.getElementById(`radio-step-${stepNumber}`);
        if (targetStep) {
            targetStep.style.display = 'block';
        }
        
        this.updateStepIndicator(stepNumber);
    }

    updateStepIndicator(activeStep) {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === activeStep);
        });
    }

    getContributors() {
        // Get contributors from split sheets or default
        const splitData = JSON.parse(localStorage.getItem('radio-splitsheets') || '{}');
        return splitData.contributors || [{
            name: 'Primary Artist',
            role: 'Artist',
            percentage: 100
        }];
    }

    getTrackData() {
        return {
            title: document.getElementById('radio-track-title')?.value || 'Unknown Track',
            artist: document.getElementById('radio-artist-name')?.value || 'Unknown Artist',
            submissionId: `radio_${Date.now()}`
        };
    }

    // Static integration method
    static enhanceApp(app) {
        const integration = new RadioSignatureIntegration();
        integration.initialize(app);
        app.radioSignatureIntegration = integration;
        return integration;
    }
}

// Simple signature pad implementation
class SimpleSignaturePad {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.drawing = false;
        this.isEmpty = true;
        this.onSign = null;
        
        this.setupEvents();
        this.setupCanvas();
    }

    setupCanvas() {
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.canvas.style.border = '1px solid #ccc';
        this.canvas.style.background = 'white';
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        
        // Touch events
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
        if (this.drawing) {
            this.drawing = false;
            if (this.onSign) this.onSign();
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

window.RadioSignatureIntegration = RadioSignatureIntegration;